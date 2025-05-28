#!/usr/bin/env bash
set -e
set -o pipefail
set -u

# This script is designed to work with AWS CLI Container image, but may also be useful for other use-cases.
# It is the user's responsibility to:
# 1. Ensure curl, tar, gzip, and jq commands are preinstalled
# 2. Ensure AWS CLI environment is pre-configured with authentication if necessary through various options:
#   a. Put credentials file under $HOME/.aws/credentials
#   b. Set AWS_CONFIG_FILE pointing to a custom credentials file path
#   c. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY directly
#   d. Refer to AWS CLI docs for more authentication options.

# Function to emit a log MESSAGE to stderr with auto-generated ISO timestamp, VERBOSITY and MESSAGE
#
# @param $1: Verbosity level string
# $param $2: Message to be logged
log() {
    local -r VERBOSITY=$1
    local -r MESSAGE=$2
    echo "$(date --utc --date="now" +"%Y-%m-%dT%H:%M:%SZ") [$VERBOSITY] $MESSAGE" >&2
}

# Function to wait until S3 endpoint is available by listing the available buckets from the S3 endpoint.
# If the listing operation succeeds, the function returns immediately.
# Otherwise, it retries a maximum of 10 times with a delay of 6 seconds between each retry.
wait_for_s3_availability() {
    log "INFO" "Waiting until s3://${LOG_VIEWER_BUCKET} endpoint becomes available ..."

    local -r MAX_RETRIES=10
    local -r RETRY_DELAY_IN_SECS=6

    for ((retries = 0; retries < $MAX_RETRIES; retries++)); do
        if aws s3 ls --endpoint-url "$AWS_ENDPOINT_URL" > /dev/null; then
          return
        fi
        log "WARN" "S3 API endpoint didn't return successfully. Retrying in $RETRY_DELAY_IN_SECS seconds ..."
        sleep $RETRY_DELAY_IN_SECS
    done

    if [[ $retries -eq $MAX_RETRIES ]]; then
        log "ERROR" "Maximum retries reached. S3 API endpoint ${AWS_ENDPOINT_URL} didn't respond."
        exit 1
    fi
}

# Function to create and configure log-viewer bucket and configure access policy
create_and_configure_bucket() {
  # Create log-viewer bucket if not already exist
  log "INFO" "Creating s3://${LOG_VIEWER_BUCKET} bucket."
  if ! aws s3api head-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET" 2>/dev/null; then
      aws s3api create-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET"
  else
      log "WARN" "Bucket s3://${LOG_VIEWER_BUCKET} already exist."
  fi

  # Define and apply the Bucket Policy for public read access
  log "INFO" "Applying public read access policy to s3://${LOG_VIEWER_BUCKET}"
  local -r POLICY=$(
      cat << EOP
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${LOG_VIEWER_BUCKET}/*"
        }
    ]
}
EOP
    )
    if ! aws s3api put-bucket-policy \
        --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET" --policy "$POLICY"; then
        log "ERROR" "Failed to set bucket policy for s3://${LOG_VIEWER_BUCKET}"
        exit 1
    fi
}

# This function infers the release download link, decompress, and uploads precompiled asset to object store
download_and_upload_assets() {
    local -r GITHUB_RELEASES_API_ENDPOINT="https://api.github.com/repos/y-scope/yscope-log-viewer/releases"
    if [[ -v TAG_NAME ]]; then
        RELEASE_TARBALL_URL=$(curl --silent --show-error "${GITHUB_RELEASES_API_ENDPOINT}/${TAG_NAME}" \
            | jq --raw-output '.assets[0].browser_download_url')
    else
        # If not defined, use latest prerelease
        RELEASE_TARBALL_URL=$(curl --silent --show-error "$GITHUB_RELEASES_API_ENDPOINT" \
            | jq --raw-output 'map(select(.prerelease)) | first | .assets[0].browser_download_url')
    fi
    if [[ -z "$RELEASE_TARBALL_URL" ]]; then
        log "ERROR" "Cannot resolve release tarball URL."
        exit 1
    fi

    # Download and decompress release tarball to a temp directory
    log "INFO" "Downloading ${RELEASE_TARBALL_URL}"
    local -r DECOMPRESSED_ASSETS_DIRECTORY=$(mktemp -d)
    if ! curl --silent --show-error --location "$RELEASE_TARBALL_URL" \
        | tar --strip-components 1 -xz -C "$DECOMPRESSED_ASSETS_DIRECTORY"; then
        log "ERROR" "Failed to download and extract the release tarball from ${RELEASE_TARBALL_URL}"
        exit 1
    fi

    # Upload all assets to object store at the root of the provided bucket
    # Note that uploads can fail with invalid/unknown checksum sent error.
    # This typically occurs with old MinIO. If this happens, update to release after late 2024.
    # See this GitHub issue for details: https://github.com/minio/minio/pull/19680
    log "INFO" "Uploading yscope-log-viewer assets to object store."
    aws s3 cp "$DECOMPRESSED_ASSETS_DIRECTORY" "s3://${LOG_VIEWER_BUCKET}/" \
        --recursive --endpoint-url "$AWS_ENDPOINT_URL"

    log "INFO" "Deployment completed successfully!"
}

# Function to print out a completion prompt MESSAGE with a box around it
print_deployment_completion_prompt() {
    prompt_MESSAGE="yscope-log-viewer is now available at ${AWS_ENDPOINT_URL}/${LOG_VIEWER_BUCKET}/index.html"
    MESSAGE_length=${#prompt_MESSAGE}
    total_length=$((MESSAGE_length + 6))
    printf "\n\n"
    printf "+%${total_length}s+\n" | tr ' ' "-"
    printf "|%${total_length}s|\n"
    printf "|   %s   |\n" "$prompt_MESSAGE"
    printf "|%${total_length}s|\n"
    printf "+%${total_length}s+\n" | tr ' ' "-"
}

# Validate required environment variables and populate optional one if not provided
readonly REQUIRED_ENV_VARS=(
  # Example: "http://minio:9091"
  "AWS_ENDPOINT_URL"

  # Example: "log-viewer"
  "LOG_VIEWER_BUCKET"
)
for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [[ -z "$var" ]]; then
      log "ERROR" "$var environment variable must be set."
      exit 1
    fi
done

wait_for_s3_availability
create_and_configure_bucket
download_and_upload_assets
print_deployment_completion_prompt
