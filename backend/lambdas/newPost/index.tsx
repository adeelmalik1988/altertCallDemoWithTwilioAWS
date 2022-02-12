// import {
//     APIGatewayProxyEvent,
//     APIGatewayProxyResult,
//     Context,

// } from "aws-lambda"
import { env } from "process";
//import { User } from "../../QueryAndMutationTypes"

import { PollyClient, Polly, StartSpeechSynthesisTaskCommand } from "@aws-sdk/client-polly";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity"
//import  twilio from "twilio"

   // Your Account SID from www.twilio.com/console
    // See http://twil.io/secure for important security information
    const accountSid = "ACd252d42b5b887f731e21d15ed286ef94";

    // Your Auth Token from www.twilio.com/console 
    // See http://twil.io/secure for important security information
    const authToken = "d4c98ab3da1b986a435cb57a0ffaadcf";

const twilioClient = require('twilio')(accountSid,authToken)

const REGION = env.REGION
const S3_BUCKET_NAME = env.S3_BUCKET_NAME
const COGNITO_IDENTITY_POOL_ID = env.COGNITO_IDENTITY_POOL_ID || ""

// Create an Amazon S3 service client object.
const pollyClient: any = new PollyClient({
    region: REGION,
    // credentials: fromCognitoIdentityPool({
    //     client: new CognitoIdentityClient({
    //         region: REGION
    //     }),
    //     identityPoolId: COGNITO_IDENTITY_POOL_ID
    // })
})

var params = {
    OutputFormat: "mp3",
    OutputS3BucketName: S3_BUCKET_NAME,
    Text: "Hello Adeel, How are you?",
    TextType: "text",
    VoiceId: "Joanna",
    SampleRate: "22050",

}

declare global {
    type ReadableStream = unknown
    type Blob = unknown
  }



//run();

export async function handler(
    event: any,
) {


    const run = async () => {
        try {
            const data = await pollyClient.send(
                new StartSpeechSynthesisTaskCommand(params)
            );
            console.log("Success, audio file added to " + params.OutputS3BucketName)
            console.log(data, "Return data from Polly")
        } catch (err) {
            console.log("Error putting object", err);
        }
    };


await run()
    console.log("event Received: ", event)
    //console.log("context Received: ", context)

}

console.log("initating SMS")
// twilioClient.messages.create({
//     body: 'Hello Taimoor from AWS Lambda!',
//     to: '+923151020319',  // your phone number
//     from: '+18304453942' // a valid Twilio number
// })
//     .then((message) => {
//         // Success, return message SID
//         console.log(message,"message from Twilio");
//     })
//     .catch((err) => {
//             // Error, return error object
//             console.log(err,"error");
//     });
    //https://s3.amazonaws.com/
const call_url = "http://twimlets.com/message?Message[0]=http://myserver.com/hello.mp3&Message[1]=Thank+You+For+Calling"
const s3fileUri = "https://s3.us-west-2.amazonaws.com/backendstack-s3buketaudiodir4bf179f2-qmsqllrhxxyv/423b8629-a5b6-4c63-bca9-d09c10a65d58.mp3"
const finalurl = "http://twimlets.com/message?Message[0]="+s3fileUri+"&Message[1]=Thank+You+For+Picking"
console.log(finalurl, "url for call")
console.log("initating CALL")

    twilioClient.calls.create({
    url: finalurl,
    //"http://twimlets.com/message?Message%5B0%5D=" + encode_url + "&",
    to: '+923151020319',  // your phone number
    from: '+18304453942' // a valid Twilio number

}) .then((call) => {
    // Success, return message SID
    console.log(call,"message from Twilio");
})
.catch((err) => {
        // Error, return error object
        console.log(err,"error");
});


// const lambda = require("aws-lambda")


// const mysql = require("serverless-mysql")({
//     config: {
//         host: env.HOST,
//         database: "mysqlDatabase",
//         user: "admin",
//         password: "adminrds",
//     }
// })

// enum USER_STATUS {
//     ACTIVE = 'ACTIVE',
//     DELETED = 'DELETED',
//     PENDING = 'PENDING'
// }


// type UserInput  = {
//     cnic: string
//     full_name: string
//     address: string
//     phone_number: string
//     user_status: USER_STATUS
// }

// type IdentityType = {
//     sub: string
//     username: string
//     defaultAuthStrategy: string

// }

// type AppsyncEvent = {
//     info: {
//         fieldName: string
//     },
//     arguments: {
//         userDetail: UserInput
//     },
//     identity: IdentityType

// }

// export async function handler(
//     event: AppsyncEvent,
// ) {

//     console.log("event Received: ", event)
//     //console.log("context Received: ", context)


//     switch (event.info.fieldName) {
//         case "addUserApprovalRequest":
//             return await addUserApprovalRequest(event.arguments.userDetail, event.identity);
//         default:
//             return null;

//     }
// }


// async function addUserApprovalRequest(userDetail: UserInput, identity: IdentityType  ) {

//     console.log( "Inputs passed to function",  userDetail, identity)


//     try {
//         // Connect to your MySQL instance first
//         await mysql.connect();
//         console.log("DB Connected");
//         // Get the connection object
//         // let connection = mysql.getClient()

//         // Simple query

//         let resultsa = await mysql.query(
//             // "CREATE TABLE IF NOT EXISTS new (task_id INT AUTO_INCREMENT, description TEXT, PRIMARY KEY (task_id))"
//             `CALL AddUserApprovalRequest(?,?,?,?,?,?)`
//             ,[  userDetail.cnic,
//                 userDetail.full_name,
//                 userDetail.address,
//                 userDetail.phone_number,
//                 userDetail.user_status,
//                 identity.sub]);

//         console.log(resultsa, "Complete result from database");
//         //console.log(resultsa[0], "results first array from database");

//         await mysql.end()


//         return resultsa.return_response;

//     } catch (e) {

//         console.log(e, "error for lambda")
//         return null
//     }

// }