// Create the DynamoDB service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Create an Amazon DynamoDB service client object.
export const ddbClient = new DynamoDBClient();

// Connections like this  should be in seperate file rather than in lambda function
// It reduces execution time, reduce concurrency
// Best practice