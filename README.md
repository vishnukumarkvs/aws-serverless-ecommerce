# Creating Ecommerce Backend in Serverless using AWS CDK and AWS SDK
System Design

![AWS Serverless Ecommerce cdk](https://user-images.githubusercontent.com/116954249/215372676-efc4b923-7bc3-4c4d-aa57-4c2c2034c972.png)


I developed an Ecommerce backend on AWS using AWS SDK for business logic and AWS CDK for infrastructure creation. The solution features 3 APIs in API Gateway, serverless business logic with AWS Lambda, and data storage in DynamoDB. I have developed 3 microservices: Product, Cart and Order microservice. Communication between the cart and order microservices is handled asynchronously via AWS EventBridge and SQS.


## CDK commands

* `cdk synth`       emits the synthesized CloudFormation template
* `cdk diff`        compare deployed stack with current state
* `cdk deploy`      deploy this stack to your default AWS account/region

## API DOC
### Product
- /product
   - GET
   - POST
- /product/{id}
	- GET
	- PUT
	- DELETE 

### Cart
- /cart
   - GET
   - POST
- /cart/{username}
	- GET
	- POST
	- DELETE 
- /cart/checkout
   - POST

### Order
- /order
   - GET
- /order/{username}
	- GET

## DynamoDB Tables and Lambda Functions
I have created 3 dynamodb tables for storing data.
- product table 
- cart table
- order table

Similarly, I have created 3 lambda functions and integrated these tables.	

## AWS EventBridge
The cart and order microservices are connected asynchronously using AWS EventBridge and SQS. When the `/cart/checkout` endpoint is triggered, an event containing cart items and total price is sent to EventBridge. The order service, subscribed to EventBridge, retrieves messages from the SQS queue and processes the order.
