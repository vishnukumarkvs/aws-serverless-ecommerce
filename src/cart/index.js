const { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { ddbClient } = require("../cart/ddbClient");

exports.handler = async function(event){
    let body;
    try{
        switch(event.httpMethod){
            case "GET":
                if(event.pathParameters !=null){
                    body = await getCartByUsername(event.pathParameters.username);
                }else{
                    body=await getAllCarts();
                }
                break;
            case "POST":
                if(event.path == "/cart/checkout"){
                    body = await checkoutCart(event);
                }else{
                    body=await createCart(event);
                }
                break;
            case "DELETE":
                body = await deleteCart(event.pathParameters.username);
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

const getCartByUsername = async(username) =>{
    console.log("getCartByUsername");

    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({username: username})

        };

        const {Item} = await ddbClient.send(new GetItemCommand(params));
        console.log(Item);

        return (Item) ? unmarshall(Item): {};
    }catch(e){
        console.error(e);
        throw e;
    }
}

const getAllCarts = async()=>{
    console.log("GetAllCarts");
    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
        };

        const {Items} = await ddbClient.send(new ScanCommand(params));
        console.log(Items);

        return (Items) ? Items.map((item)=>unmarshall(item)):{};
    }catch(e){
        console.error(e);
        throw e;
    }
}


const createCart = async(event) =>{
    console.log("createCart");
    try{
        const requestBody = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(requestBody || {})
        }
        const createResult = await ddbClient.send(new PutItemCommand(params));
        console.log(createResult);
        return createResult;
    }catch(e){
        console.error(e);
        throw e;
    }
}

const deleteCart = async(username) =>{
    try{
        console.log("deleteCart");
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({username: username})
        }
        const deleteResult = await ddbClient.send(new DeleteItemCommand(params));
        console.log(deleteResult);
        return deleteResult;
    }catch(e){
        console.error(e);
        throw e;
    }
}

const checkoutCart = async(event) => {
    console.log("checkoutCart");

    // publish event to eventbridge - will get subscribed by order microservice
    // It starts ordering process
    return {};
}

// Post cart request body
// {
//     "username": "Vishnu",
//     "items": [
//         {
//             "quantity": 2,
//             "color": "Red",
//             "price": 950,
//             "productId": "aaaa-bbbb-cccc",
//             "productName": "Iphone X"
//         },
//         {
//             "quantity": 1,
//             "color": "Blue",
//             "price": 10,
//             "productId": "ffff-bbbb-cccc",
//             "productName": "Potato Chips"
//         }
//     ]
// }