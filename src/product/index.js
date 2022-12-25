const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
import { DeleteItemCommand, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import ddbClient  from "./ddbClient";
import {v4 as uuidv4} from 'uuid';

exports.handler = async function(event){
    console.log("request:", JSON.stringify(event,undefined,2));

    // Check event.httpMethod to perform CRUD ops using ddbClient
    switch(event.httpMethod){
        case "GET":
            if(event.pathParameters = null){
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
        default:
            throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }
    return{
        statusCode: 200,
        headers: {"Content-Type": "text/plain"},
        body: body
    }
}

// async -> retrieve data from dynamodb
const getProduct = async(productId) => {
    console.log("getProduct");
    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({id: productId})
        }
        const data = await ddbClient.send(new GetItemCommand(params));
        console.log("Success", data, data.Item);
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
        }
        const {Items} = await ddbClient.send(new ScanCommand(params));
        console.log("Success", Items);
        return (Items)? Items.map((item)=>{unmarshall(item)}):{};
    }catch(e){
        console.error(e);
    }
}

const postProduct = async(body) => {
    console.log("postProduct");
    try{
        let requestJson = unmarshall(body);
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
        console.log(data);
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