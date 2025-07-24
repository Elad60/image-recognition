# ScanER

**AI-Powered Image Moderation Platform**

---

## Overview

ScanER is a full-stack web application that leverages artificial intelligence to detect inappropriate or harmful content in images. Designed for developers, platform owners, and content managers, ScanER provides fast, accurate, and privacy-focused moderation to keep platforms safe and compliant.

---

## Technologies Used

- **Frontend:** HTML, CSS (Bootstrap), JavaScript (jQuery)
- **Backend:** AWS Lambda (Python), Amazon Rekognition, API Gateway, S3, DynamoDB, SNS
- **Authentication:** Amazon Cognito
- **Infrastructure:** AWS CloudFormation

---

## Features

- **AI-Based Image Moderation:** Detects nudity, violence, hate symbols, and more using advanced AI models.
- **Image Inspector:** Upload and analyze images for unsafe content in real time.
- **Webpage Scanner:** Scan any public webpage for images and analyze them for harmful content.
- **User Profiles:** View your scan history and moderation results.
- **Community (Admin Feature):** Explore scans from other users
- **Authentication:** Secure sign-in with AWS Cognito.
- **Modern UI:** Responsive, user-friendly interface built with Bootstrap and jQuery.

---

## Architecture

ScanER is built on a robust AWS serverless stack:

- **Frontend:** HTML, CSS (Bootstrap), JavaScript (jQuery)
- **Authentication:** Amazon Cognito
- **Backend:**
  - AWS Lambda (Python) for image analysis, URL scanning, and user management
  - Amazon Rekognition for AI-powered image content analysis
  - Amazon S3 for image storage
  - Amazon DynamoDB for metadata and scan results
  - Amazon API Gateway for secure API access
  - Amazon SNS for alerting
- **Deployment:** AWS CloudFormation for infrastructure as code

### High-Level Diagram

```
User ──> Web App ──> API Gateway ──> Lambda Functions ──> S3 / DynamoDB / Cognito
```

#### AWS Architecture Diagram

![AWS Architecture Diagram](images/architecture-diagram.JPEG)

#### UML Sequence Diagram

![UML Sequence Diagrams](images/UML-Sequence.jpeg)

---

## Usage

- **Image Inspector:** Upload an image to check for unsafe content.
- **Page Analysis:** Enter a URL to scan all images on a webpage.
- **Profile:** View your scan history and moderation results.

---

## Screenshots

> _Add screenshots of the main UI pages here for extra impact in interviews._

---

## License

This project is for demonstration and interview purposes only.

---

## Setup & Deployment

### 1. AWS CloudShell Setup

- Upload `template.yaml` and all Lambda `.py` files to CloudShell.
- Zip each Lambda function as shown below:

```bash
mkdir lambdas && cd lambdas
zip detectimage.zip detect_image.py
zip uploadpresignedurl.zip upload_presigned_url.py
zip getimagelabels.zip get_image_labels.py
zip getuserscans.zip get_user_scans.py
zip getprofilesuploadcount.zip get_profiles_upload_count.py
zip scanurl.zip scan_url.py
zip scanpageimages.zip scan_page_images.py
```

### 2. Deploy CloudFormation Stack

```bash
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name ScanERstack \
  --capabilities CAPABILITY_NAMED_IAM
```

### 3. Upload Lambda Code

Update each Lambda function with your zipped code:

```bash
aws lambda update-function-code --function-name DetectImage-ScanERstack --zip-file fileb://lambdas/detectimage.zip
# ...repeat for each function
```

### 4. Cognito User Setup

```bash
aws cognito-idp sign-up --client-id <CLIENT_ID> --username test@example.com --password <PASSWORD>
aws cognito-idp admin-confirm-sign-up --user-pool-id <USER_POOL_ID> --username test@example.com
```

### 5. API Testing

- Use your Cognito ID token to call the API:

```bash
curl -X GET 'https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/image?imageName=test_image.png' \
  -H 'Authorization: <ID_TOKEN>'
```
