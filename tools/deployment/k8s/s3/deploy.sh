#!/usr/bin/env bash

# This script is tailored for the official AWS CLI container image provided by Amazon (amazon/aws-cli).
# Prior to running the script, ensure that your AWS credentials or secrets are configured using environment variables.
# You can set them up in the following ways:
# 1. Use AWS_CONFIG_FILE to specify the path to a configuration file.
# 2. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY directly as environment variables.
# 3. Refer to the AWS CLI documentation for additional authentication methods available.

wait_for_s3_availability() {
    max_retries=10
    retry_delay=6

    retries=0
    while [ $retries -lt $max_retries ]; do
        if aws s3 ls --endpoint-url "$AWS_ENDPOINT_URL" >/dev/null 2>&1; then
            echo "S3 API endpoint ${AWS_ENDPOINT_URL} is healthy. Proceeding..."
            break
        else
            echo "S3 API endpoint did not return successfully. Retrying in $retry_delay seconds..."
            retries=$((retries+1))
            sleep $retry_delay
        fi
    done

    if [ $retries -eq $max_retries ]; then
        echo "Maximum retries reached. S3 API endpoint ${AWS_ENDPOINT_URL} did not respond."
        exit 1
    fi
}

if [ -z "$DECOMPRESSED_ASSETS_DIRECTORY" ]; then
    # If not defined, provide a default value
    DECOMPRESSED_ASSETS_DIRECTORY="/tmp/yscope-log-viewer"
fi

# Download and extract YScope log viewer RELEASE tarball
echo "------------------------------------------------------------------------------------------"
echo "Downloading YScope log-viewer release from"
echo ${RELEASE_URL}
mkdir -p $DECOMPRESSED_ASSETS_DIRECTORY
curl -sSL "$RELEASE_URL" | tar --strip-components 1 -xz -C $DECOMPRESSED_ASSETS_DIRECTORY

# Wait until S3 endpoint is available
echo "------------------------------------------------------------------------------------------"
wait_for_s3_availability

# Create log-viewer bucket if not already exist
if ! aws s3api head-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET" 2>/dev/null; then
    echo "Creating s3://${LOG_VIEWER_BUCKET} bucket."
    aws s3api create-bucket --endpoint-url "$AWS_ENDPOINT_URL" --bucket "$LOG_VIEWER_BUCKET"
else
    echo "Bucket s3://${LOG_VIEWER_BUCKET} already exists."
fi

# Define and apply the Bucket Policy for public read access
echo "Applying public read access policy to s3://${LOG_VIEWER_BUCKET}"
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
aws s3api put-bucket-policy --endpoint-url "${AWS_ENDPOINT_URL}" --bucket "${LOG_VIEWER_BUCKET}" --policy "$POLICY"

# Upload all assets to object store at the root of the provided bucket
# Note that uploads can fail with invalid/unknown checksum sent error. This is a known issue and not fatal.
# See this GitHub issue for details: https://github.com/minio/minio/pull/19680
echo "Uploading YScope log-viewer assets to object store"
cd "$DECOMPRESSED_ASSETS_DIRECTORY" || exit 1
aws s3 cp "$DECOMPRESSED_ASSETS_DIRECTORY" "s3://${LOG_VIEWER_BUCKET}/" \
    --recursive --endpoint-url "$AWS_ENDPOINT_URL"

echo "------------------------------------------------------------------------------------------"
echo "Log-viewer deployed and accessible at ${AWS_ENDPOINT_URL}/${LOG_VIEWER_BUCKET}/index.html"
echo "------------------------------------------------------------------------------------------"