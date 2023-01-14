const { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { ddbClient } = require("../cart/ddbClient");
const { ebClient } = require("./eventbridgeClient");

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

    // Get existing cart
    // create event json object with cart items
    // calculate total price
    // publish event to eventbridge
    // remove existing cart

    const checkoutRequest = JSON.parse(event.body);
    if(checkoutRequest == null || checkoutRequest.username == null){
        throw new Error(`username should exist in checkoutRequest:${checkoutRequest}`)
    }

    const cart = await getCartByUsername(checkoutRequest.username);
    var checkoutPayload = preparePayload(checkoutRequest, cart);
    const publishEvent = await publishCheckoutcartEvent(checkoutPayload);

    await deleteCart(checkoutRequest.username);
}


const preparePayload = (checkoutRequest, cart) =>{
    try{
        if(cart==null || cart.items == null){
            throw new Error(`items should exist in cart:${cart}`)
        }
        let total_price = 0;
        cart.items.forEach(item => total_price+=item.price);
        checkoutRequest.total_price=total_price;
        console.log(checkoutRequest);

        // copies all properties from cart to request
        Object.assign(checkoutRequest, cart);
        console.log(`Success prepareOrderPayload: ${checkoutRequest}`);
        return checkoutRequest;
    }catch(e){
        console.error(e);
        throw e;
    }
}

const publishCheckoutcartEvent = async (payload) =>{
    console.log("publishCheckoutcartEvent", payload);
    try{
        const params = {
            Entries:[
                {
                    Source: process.env.EVENT_SOURCE,
                    Detail: JSON.stringify(payload),
                    DetailType: process.env.EVENT_DETAIL_TYPE,
                    Resources:[],
                    EventBusName: process.env.EVENTBUS_NAME
                }
            ]
        }
        const data = await ebClient.send(new PutEventsCommand(params));
        console.log("Success, event sent, requestId:", data);
        return data;
    }catch(e){
        console.error(e);
        throw e;
    }
}

// Post cart post body
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