const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const targetKey = key.replace("processed", "thumbnails");

  try {
    // Download the image from S3
    const params = {
      Bucket: bucket,
      Key: key,
    };
    const originalImage = await s3.getObject(params).promise();

    // Log that we successfully downloaded the image
    console.log("Downloaded image from S3");

    // Resize the image
    const resizedImage = await sharp(originalImage.Body)
      .resize(128, 128)
      .toBuffer();

    // Log that we successfully resized the image
    console.log("Resized image");

    // Upload the resized image to S3
    const uploadParams = {
      Bucket: bucket,
      Key: targetKey,
      Body: resizedImage,
      ContentType: "image/jpeg",
    };
    await s3.putObject(uploadParams).promise();

    // Log that we successfully uploaded the image
    console.log("Uploaded image to S3");

    return {
      statusCode: 200,
      body: JSON.stringify("Image resized and uploaded successfully!"),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify("Error processing image"),
    };
  }
};
