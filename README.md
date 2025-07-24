# 🔍 ScanER – AI-Powered Image Moderation Platform
![ScanER UI Preview](images/architecture-diagram.JPEG)

ScanER is a full-stack serverless web application using AI to detect harmful content in images and webpages. Built with AWS services.

---

## 📌 Project Overview

ScanER allows:
- Uploading images to detect unsafe content using Amazon Rekognition
- Scanning webpages and analyzing embedded images
- Viewing personal scan history
- Admins exploring scans performed across the platform

Built with:
- **Frontend:** HTML, CSS (Bootstrap), JavaScript (jQuery)
- **Backend:** AWS Lambda (Python), Rekognition, S3, DynamoDB, Cognito, API Gateway, SNS
- **Infrastructure:** AWS CloudFormation

---

## 🧱 System Architecture

![ScanER Architecture Diagram](images/architecture-diagram.JPEG)

<div align="center">
  <img src="images/UML-Sequence.jpeg" alt="ScanER Sequence Diagram" width="600" height="800"/>
</div>

### 🗂 Amazon DynamoDB
- `ImageLabels`: Stores scan results for each uploaded image
- `MyImageMetadataTable`: Stores user metadata and scan history

### 🖼 Amazon S3
- `ScanERImageBucket`: Stores uploaded image files

### 👥 Amazon Cognito
- Manages user authentication and session tokens
- Supports sign-up, login, and token-based access

### ⚙ AWS Lambda Functions
- `DetectImage`: Analyze images with Rekognition
- `UploadPresignedUrl`: Get upload URLs
- `GetImageLabels`: Retrieve analysis results
- `GetUserScans`: View user history
- `GetProfilesUploadCount`: Admin stats
- `ScanURL`: Scan image from URL
- `ScanPageImages`: Scan all images from a webpage

### 📡 Amazon SNS
- Sends alerts for dangerous labels (e.g. Gun, Weapon)

### 🌐 Amazon API Gateway
- Connects frontend requests to Lambda with Cognito auth

---

## 💻 Frontend Pages

| File             | Description                                 |
|------------------|---------------------------------------------|
| `index.html`     | Landing and image upload                    |
| `urlscan.html`   | Scan public webpage                         |
| `profile.html`   | View personal scan history                  |
| `community.html` | Admin: Explore scans from all users         |

### Key JavaScript Files

- `main.js`: UI logic and layout
- `auth.js`: Cognito login/register
- `upload.js`: Upload + moderate images
- `urlscan.js`: URL-based scanning
- `profile.js`: Display scan history
- `community.js`: Admin stats view

---

## 🎨 User Interface Design

- Role-based navigation (SimpleUser vs Admin)
- Bootstrap-based responsive layout
- Friendly and clear result UI
- Color-coded moderation labels

---

## 🧪 Demo & Testing

### Test Users

| Role        | Email              | Password    |
|-------------|--------------------|-------------|
| Admin       | admin@scaner.com   | Admin123!   |
| SimpleUser  | user@scaner.com    | User123!    |

### Online Demo

🔗 https://scaner-app-files.s3.us-east-1.amazonaws.com/index.html

---

## 🔧 Installation & Deployment

> Requires AWS CLI, CloudFormation, and S3

### 1. Prepare Lambda ZIPs

```bash
mkdir lambdas && cd lambdas
zip detectimage.zip detect_image.py
zip uploadpresignedurl.zip upload_presigned_url.py
zip getimagelabels.zip get_image_labels.py
zip getuserscans.zip get_user_scans.py
zip getprofilesuploadcount.zip get_profiles_upload_count.py
zip scanurl.zip scan_url.py
zip scanpageimages.zip scan_page_images.py

### 2. Deploy CloudFormation Stack

```bash
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name ScanERstack \
  --capabilities CAPABILITY_NAMED_IAM
```

### 3. Upload Lambda Code

```bash
aws lambda update-function-code --function-name DetectImage-ScanERstack --zip-file fileb://lambdas/detectimage.zip
aws lambda update-function-code --function-name UploadPresignedUrl-ScanERstack --zip-file fileb://lambdas/uploadpresignedurl.zip
aws lambda update-function-code --function-name GetImageLabels-ScanERstack --zip-file fileb://lambdas/getimagelabels.zip
aws lambda update-function-code --function-name GetUserScans-ScanERstack --zip-file fileb://lambdas/getuserscans.zip
aws lambda update-function-code --function-name GetProfilesUploadCount-ScanERstack --zip-file fileb://lambdas/getprofilesuploadcount.zip
aws lambda update-function-code --function-name ScanURL-ScanERstack --zip-file fileb://lambdas/scanurl.zip
aws lambda update-function-code --function-name ScanPageImages-ScanERstack --zip-file fileb://lambdas/scanpageimages.zip
```

### 4. Create & Confirm Cognito User

```bash
aws cognito-idp sign-up \
  --client-id <CLIENT_ID> \
  --username user@scaner.com \
  --password User123!

aws cognito-idp admin-confirm-sign-up \
  --user-pool-id <USER_POOL_ID> \
  --username user@scaner.com
```

### 5. API Testing Example

```bash
curl -X GET \
  'https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/image?imageName=test.png' \
  -H 'Authorization: <ID_TOKEN>'
```
