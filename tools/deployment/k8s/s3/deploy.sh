#!/usr/bin/env bash

set -e
set -o pipefail
set -u

# This script is optimized to run within the AWS CLI Container image. User is responsibility to:
# 1. Ensure curl, tar, gzip, and jq commands are preinstalled
# 2. Ensure container is configured with AWS CLI authentication if necessary via various options:
#   a. Put credentials file under $HOME/.aws/credentials
#   b. Set AWS_CONFIG_FILE pointing to a custom credentials file path
#   c. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY directly
#   d. Refer to AWS CLI docs for more authentication options.

# Emits a log event to stderr with an auto-generated ISO timestamp as well as the given level
# and message.
#
# @param $1: Level string
# @param $2: Message to be logged
log() {
    local -r LEVEL=$1
    local -r MESSAGE=$2
    echo "$(date --utc --date="now" +"%Y-%m-%dT%H:%M:%SZ") [${LEVEL}] ${MESSAGE}" >&2
}

# Waits for the S3 endpoint to be available, or exits if it's unavailable.
wait_for_s3_availability() {
    # Check availability by listing available buckets
    log "INFO" "Waiting until ${AWS_ENDPOINT_URL} endpoint becomes available."
    local -r MAX_RETRIES=10
    local -r RETRY_DELAY_IN_SECS=6
    for ((retries = 0; retries < MAX_RETRIES; retries++)); do
        if aws s3 ls --endpoint-url "$AWS_ENDPOINT_URL" >/dev/null; then
            return
        fi
        log "WARN" "S3 API endpoint unavailable. Retrying in ${RETRY_DELAY_IN_SECS} seconds."

        sleep "$RETRY_DELAY_IN_SECS"
    done

    if [[ $retries -eq $MAX_RETRIES ]]; then
        log "ERROR" "Maximum retries reached. S3 API endpoint ${AWS_ENDPOINT_URL} didn't respond."
        exit 1
    fi
}

# Creates and configures the log viewer bucket, or exits on failure.
create_and_configure_bucket() {
    # Create log-viewer bucket if it doesn't already exist
    log "INFO" "Creating ${LOG_VIEWER_BUCKET_S3_URI} bucket."
    if ! aws s3api head-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET" \
        1>/dev/null; then
        aws s3api create-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET"
    else
        log "WARN" "Bucket ${LOG_VIEWER_BUCKET_S3_URI} already exists."
    fi

    # Define and apply the bucket policy for public read access
    log "INFO" "Applying public read access policy to ${LOG_VIEWER_BUCKET_S3_URI}"
    local -r POLICY=$(
        cat <<EOP
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
        --endpoint-url "$AWS_ENDPOINT_URL" \
        --bucket "$LOG_VIEWER_BUCKET" \
        --policy "$POLICY"; then
        log "ERROR" "Failed to set bucket policy for ${LOG_VIEWER_BUCKET_S3_URI}"
        exit 1
    fi
}

# Downloads, extracts, and uploads the release to the object store. Exits on failure.
download_and_upload_assets() {
    local GITHUB_RELEASES_API_ENDPOINT
    GITHUB_RELEASES_API_ENDPOINT="https://api.github.com/repos/y-scope/yscope-log-viewer/releases"
    readonly GITHUB_RELEASES_API_ENDPOINT

    if [[ -v TAG_NAME ]]; then
        RELEASE_TARBALL_URL=$(curl --silent --show-error \
            "${GITHUB_RELEASES_API_ENDPOINT}/${TAG_NAME}" \
            | jq --raw-output ".assets[0].browser_download_url")
    else
        # Use latest prerelease
        RELEASE_TARBALL_URL=$(curl --silent --show-error "$GITHUB_RELEASES_API_ENDPOINT" \
            | jq --raw-output "map(select(.prerelease)) | first | .assets[0].browser_download_url")
    fi
    if [[ -z "$RELEASE_TARBALL_URL" ]]; then
        log "ERROR" "Cannot resolve release tarball URL."
        exit 1
    fi

    # Download and decompress release tarball to a temp directory
    log "INFO" "Downloading ${RELEASE_TARBALL_URL}"
    local -r DECOMPRESSED_ASSETS_DIRECTORY=$(mktemp -d)
    if ! curl --silent --show-error --location "$RELEASE_TARBALL_URL" \
        | tar --strip-components 1 -xz --directory "$DECOMPRESSED_ASSETS_DIRECTORY"; then
        log "ERROR" "Failed to download and extract release tarball from ${RELEASE_TARBALL_URL}"
        exit 1
    fi

    # Upload all assets to object store at the root of the provided bucket
    # NOTE: Uploads can fail with an invalid/unknown checksum sent error. This typically occurs with
    # older versions of MinIO. If this happens, update to a release after late 2024. See this GitHub
    # issue for details: https://github.com/minio/minio/pull/19680
    log "INFO" "Uploading yscope-log-viewer assets to ${LOG_VIEWER_BUCKET_S3_URI}"
    aws s3 cp \
        "$DECOMPRESSED_ASSETS_DIRECTORY" \
        "$LOG_VIEWER_BUCKET_S3_URI" \
        --recursive \
        --endpoint-url "$AWS_ENDPOINT_URL"

    log "INFO" "Deployment completed successfully!"
}

# Prints out a message indicating the deployment is complete
print_deployment_completion_message() {
    local MESSAGE="yscope-log-viewer is now available at"
    MESSAGE+=" ${AWS_ENDPOINT_URL}/${LOG_VIEWER_BUCKET}/index.html"
    readonly MESSAGE
    local -r PADDING_SPACES="   "

    total_length=$((${#PADDING_SPACES} + ${#MESSAGE} + ${#PADDING_SPACES}))
    printf "\n\n"
    printf "+%${total_length}s+\n" | tr " " "-"
    printf "|%${total_length}s|\n"
    printf "|%s%s%s|\n" "$PADDING_SPACES" "$MESSAGE" "$PADDING_SPACES"
    printf "|%${total_length}s|\n"
    printf "+%${total_length}s+\n" | tr " " "-"
}

# Validate required environment variables
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

readonly LOG_VIEWER_BUCKET_S3_URI="s3://${LOG_VIEWER_BUCKET}"

wait_for_s3_availability
create_and_configure_bucket
download_and_upload_assets
print_deployment_completion_message
