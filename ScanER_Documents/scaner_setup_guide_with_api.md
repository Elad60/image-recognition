# 🧠 ScanER Full Setup - AWS CloudShell Instructions

## ✅ 1. Prepare Your Environment

Open [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) and upload:

- `template.yaml` (this file)
- All your Lambda `.py` files

Then zip each function:

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

## 🏗️ 2. Deploy the CloudFormation Stack

```bash
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name ScanERstack \
  --capabilities CAPABILITY_NAMED_IAM
```

## 🔁 3. Upload Lambda Code After Stack Deployment

Run the following to update the code for each Lambda:

```bash
aws lambda update-function-code --function-name DetectImage-ScanERstack --zip-file fileb://lambdas/detectimage.zip
aws lambda update-function-code --function-name UploadPresignedUrl-ScanERstack --zip-file fileb://lambdas/uploadpresignedurl.zip
aws lambda update-function-code --function-name GetImageLabels-ScanERstack --zip-file fileb://lambdas/getimagelabels.zip
aws lambda update-function-code --function-name GetUserScans-ScanERstack --zip-file fileb://lambdas/getuserscans.zip
aws lambda update-function-code --function-name GetProfilesUploadCount-ScanERstack --zip-file fileb://lambdas/getprofilesuploadcount.zip
aws lambda update-function-code --function-name ScanURL-ScanERstack --zip-file fileb://lambdas/scanurl.zip
aws lambda update-function-code --function-name ScanPageImages-ScanERstack --zip-file fileb://lambdas/scanpageimages.zip
```

## 🔐 4. Cognito Setup (User Creation)

```bash
aws cognito-idp sign-up \
  --client-id <CLIENT_ID> \
  --username test@example.com \
  --password Elad1234!

aws cognito-idp admin-confirm-sign-up \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com
```

Use `initiate-auth` to log in and get your ID token.

✅ The full ScanER system is now deployed and ready to use.

## 🌐 5. Test API Gateway with Cognito Authentication

### 🔐 Step 1: Get ID Token (Login)
Use AWS CLI to log in and retrieve your `IdToken`:

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <CLIENT_ID> \
  --auth-parameters USERNAME=test@example.com,PASSWORD=Elad1234!
```

Copy the `IdToken` from the response.

---

### 🌐 Step 2: Call the API with the Token

```bash
curl -X GET 'https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/image?imageName=test_image.png' \
  -H 'Authorization: <ID_TOKEN>'
```

📌 Replace `<API_ID>` with the real API ID shown in CloudFormation output.  
📌 Replace `<ID_TOKEN>` with the token from step 1.

---

✅ This will call your `GetImageLabels` Lambda through API Gateway with Cognito Auth.
