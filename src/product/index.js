const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
import { DeleteItemCommand, GetItemCommand, ScanCommand, UpdateItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import {ddbClient}  from "./ddbClient";
import {v4 as uuidv4} from 'uuid';

exports.handler = async function(event){
    console.log("request:", JSON.stringify(event,undefined,2));

    let body;
    // Check event.httpMethod to perform CRUD ops using ddbClient
    try{
        switch(event.httpMethod){
            case "GET":
                if(event.queryStringParameters != null){
                    body = await getProductsByCategory(event); // GET product/1234?category=Pen
                }else if(event.pathParameters != null){
                    body= await getProduct(event.pathParameters.id);
                }else{
                    body = await getAllProducts();
                }
                break;
            case "POST":
                body = await postProduct(event.body);
                break;
            case "DELETE":
                body = await deleteProduct(event.pathParameters.id);
                break;
            case "PUT":
                body = await updateProduct(event);
                break;
            default:
                throw new Error(`Unsupported route: "${event.httpMethod}"`);
        }
        // console.log(body, "a1");
        return{
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully finished operation: "${event.httpMethod}"`,
                body: body
              })
        }
    }catch(e){
        // console.error(e);
        // console.log("a2");
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to perform operation",
                errorMsg: e.message,
                errorStack: e.stack,
            })
        }
    }
}

// async -> retrieve data from dynamodb
const getProduct = async(productId) => {
    console.log("getProduct");
    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME, //Gets from env of lambda function
            Key: marshall({id: productId})
        }
        const data = await ddbClient.send(new GetItemCommand(params));
        // console.log("Success", data, data.Item);
        return (data.Item)?unmarshall(data.Item):{};
    }catch(e){
        console.error(e);
        throw e;
    }
}

const getAllProducts = async() =>{
    console.log("getAllProducts");
    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
        };
        const {Items} = await ddbClient.send(new ScanCommand(params));
        // console.log("Success", Items);
        return (Items)? Items.map((item)=>unmarshall(item)):{}; // Should be exact
    }catch(e){
        console.error(e);
        throw e;
    }
}

const postProduct = async(body) => {
    console.log("postProduct");
    try{
        let requestJson = JSON.parse(body);
        // console.log("t1",requestJson,body,"t2");
        const productId=uuidv4();
        requestJson.id = productId;

        // const params = {
        //     TableName: process.env.DYNAMODB_TABLE_NAME,
        //     Item: {
        //       PRODUCT_ID: { S: requestJson.Id },
        //       PRODUCT_TITLE: { S: requestJson.Title },
        //       PRODUCT_PRICE: {N: requestJson.Price},
        //       PRODUCT_DESCRIPTION: {S: requestJson.Description}
        //     }
        // }
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(requestJson || {})
        }
        const data = await ddbClient.send(new PutItemCommand(params));
        // console.log("Success posting prod",data);
        return data;
    }catch(e){
        console.log(e);
        throw e;
    }
}

const deleteProduct = async(productId) =>{
    console.log(`deleproduct with id; ${productId}`);

    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({id: productId})
        }
        const deleteResult = await ddbClient.send(new DeleteItemCommand(params))
        console.log(deleteResult);
        return deleteResult;
    }catch(e){
        console.log(e);
        throw e;
    }
}


const updateProduct = async(event) => {
    console.log("updateProduct");
    try{
        let requestJson = JSON.parse(event.body);
        const objKeys = Object.keys(requestJson);
        console.log(`updateProduct function, requestBody: "${requestJson}", objKeys: ${objKeys}`);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({id: event.pathParameters.id}),
            UpdateExpression: `SET ${objKeys.map((_,index)=> `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc,key,index)=>({
                ...acc,
                [`#key${index}`]: key,
            }),{}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc,key,index)=>({
                ...acc,
                [`:value${index}`]: requestJson[key]
            }),{}))
        }
        const data = await ddbClient.send(new UpdateItemCommand(params));
        console.log(data);
        return data;
    }catch(e){
        console.log(e);
        throw e;
    }
}

const getProductsByCategory = async(event) => {
    console.log("getProductsByCategory");
    try{
        // GET product/1234?category=Phone
        const productId=event.pathParameters.id;
        const category = event.queryStringParameters.category;

        const params = {
            KeyConditionExpression: "id = :productId",
            FilterExpression: "contains (category, :category)",
            ExpressionAttributeValues: {
                ":productId": {S: productId},
                ":category": {S: category}
            },
            TableName: process.env.DYNAMODB_TABLE_NAME
        }

        const {Items} = await ddbClient.send(new QueryCommand(params));
        console.log(Items);
        return Items.map((item)=>unmarshall(item));

    }catch(e){
        console.error(e);
        throw e;
    }
}


// Post request body


// {
//     "name": "Iphone 34",
//     "description": "Phone product from Apple",
//     "imageFile":"iphone13.png",
//     "category":"phone",
//     "price": 850
// }