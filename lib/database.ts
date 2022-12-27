import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class MyDatabase extends Construct{
    // create public member inside the class to export object
    public readonly productTable:ITable;
    
    constructor(scope: Construct, id: string){
        super(scope,id);

        // product table
        // product: PK - id -- name - description - imageFile - price - category
        const productTable = new Table(this, 'product',{
            partitionKey: {name: 'id', type: AttributeType.STRING},
            tableName: "product",
            removalPolicy: RemovalPolicy.DESTROY, // for cdk destroy
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        this.productTable=productTable;
    }
}