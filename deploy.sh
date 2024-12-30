#!/bin/bash
# Set the stage from the first argument or default to 'dev'
export MS_STAGE=${1:-dev}

# Echo the stage to verify
echo ":: Development by CROMO Y NIQUEL PROJECT"
echo ":: Deploying to stage: $MS_STAGE"
echo ":: Infraestructure: AWS"

# Deploy with serverless
serverless deploy --stage $MS_STAGE
