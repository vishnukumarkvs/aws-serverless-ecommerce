exports.handler = async function(event){
    console.log("Ordering microservice");
    return{
        statusCode: 200,
        body: JSON.stringify(`You have hit ${event.path}`)
    }
}