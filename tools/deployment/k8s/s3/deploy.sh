#!/usr/bin/env bash
set -eo pipefail

# AWS CLI Container Image Script
# Ensure AWS CLI environment setup:
# - Use official AWS CLI container image (amazon/aws-cli).
# - Ensure curl, xdg-utils, tar, gzip, and jq is installed.
# - Configure AWS credentials using environment variables.
#   - Set AWS_CONFIG_FILE for configuration file path.
#   - Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY directly.
#   - Refer to AWS CLI docs for more authentication options.

# Expected Environment Variables:
# - AWS_ENDPOINT_URL: Example - "http://minio:9091"
# - LOG_VIEWER_BUCKET: Example - "log-viewer"
# - TAG_NAME: Example - "latest" (latest stable release), A GitHub release tag, or <empty> (latest prerelease)

LOG() {
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") $1" >&2
}

wait_for_s3_availability() {
    local max_retries=10
    local retry_delay=6

    local retries=0
    while [ $retries -lt $max_retries ]; do
        if ! aws s3 ls --endpoint-url "$AWS_ENDPOINT_URL" > /dev/null 2>&1; then
            LOG "[INFO] S3 API endpoint did not return successfully. Retrying in $retry_delay seconds ..."
            retries=$((retries+1))
            sleep $retry_delay
        else
            break
        fi
    done

    if [ $retries -eq $max_retries ]; then
        LOG "[ERROR] Maximum retries reached. S3 API endpoint ${AWS_ENDPOINT_URL} didn't respond"
        exit 1
    fi
}

# If if mandatory environment variables are specified
for var in "AWS_ENDPOINT_URL" "LOG_VIEWER_BUCKET"; do
    if [ -z "${!var}" ]; then
        LOG "[ERROR] $var environment variable must be specified"
        exit 1
    fi
done

# Fetch RELEASE_TARBALL_URL via GitHub API and download release
if [ -z "$TAG_NAME" ]; then
    # If not defined, use latest prerelease
    RELEASE_TARBALL_URL=$(curl --silent --show-error \
      "https://api.github.com/repos/y-scope/yscope-log-viewer/releases" | \
      jq -r 'map(select(.prerelease)) | first | .assets[0].browser_download_url')
else
    RELEASE_TARBALL_URL=$(curl --silent --show-error \
      "https://api.github.com/repos/y-scope/yscope-log-viewer/releases/${TAG_NAME}" | \
      jq -r '.assets[0].browser_download_url')
fi

# Wait until S3 endpoint is available
LOG "[INFO] Waiting until s3://${LOG_VIEWER_BUCKET} endpoint becomes available ..."
wait_for_s3_availability

# Create log-viewer bucket if not already exist
LOG "[INFO] Creating s3://${LOG_VIEWER_BUCKET} bucket"
if ! aws s3api head-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET" 2>/dev/null; then
    aws s3api create-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET"
else
    LOG "[WARN] Bucket s3://${LOG_VIEWER_BUCKET} already exists"
fi

# Define and apply the Bucket Policy for public read access
LOG "[INFO] Applying public read access policy to s3://${LOG_VIEWER_BUCKET}"
POLICY=$(cat <<EOP
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
  --endpoint-url "${AWS_ENDPOINT_URL}" --bucket "${LOG_VIEWER_BUCKET}" --policy "$POLICY"; then
    LOG "[ERROR] Failed to set bucket policy for s3://${LOG_VIEWER_BUCKET}"
    exit 1
fi

# If not defined, provide a default temp path for decompressed assets
LOG "[INFO] Downloading ${RELEASE_TARBALL_URL}"
DECOMPRESSED_ASSETS_DIRECTORY="/tmp/yscope-log-viewer"
mkdir -p "$DECOMPRESSED_ASSETS_DIRECTORY"
if ! curl --silent --show-error --location "$RELEASE_TARBALL_URL" | \
  tar --strip-components 1 -xz -C "$DECOMPRESSED_ASSETS_DIRECTORY"; then
    LOG "[ERROR] Failed to download and extract the release tarball from ${RELEASE_TARBALL_URL}"
    # Add error handling steps here, such as logging the error or exiting the script
    exit 1  # Exit the script with an error status
fi

# Upload all assets to object store at the root of the provided bucket
# Note that uploads can fail with invalid/unknown checksum sent error. This is a known issue and not fatal.
# See this GitHub issue for details: https://github.com/minio/minio/pull/19680
LOG "[INFO] Uploading yscope-log-viewer assets to object store"
aws s3 cp "$DECOMPRESSED_ASSETS_DIRECTORY" "s3://${LOG_VIEWER_BUCKET}/" \
    --recursive --endpoint-url "$AWS_ENDPOINT_URL"

LOG "[INFO] Deployment completed successfully"

# Print out a prompt message with a box around it
prompt_message="yscope-log-viewer is now available at ${AWS_ENDPOINT_URL}/${LOG_VIEWER_BUCKET}/index.html"
message_length=${#prompt_message}
total_length=$((message_length + 6))
printf "\n\n"
printf "+%${total_length}s+\n" | tr ' ' "-"
printf "|%${total_length}s|\n"
printf "|   $prompt_message   |\n"
printf "|%${total_length}s|\n"
printf "+%${total_length}s+\n" | tr ' ' "-"
