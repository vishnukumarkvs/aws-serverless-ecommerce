import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class MyDatabase extends Construct{
    // create public member inside the class to export object
    public readonly productTable:ITable;
    public readonly cartTable:ITable;
    
    constructor(scope: Construct, id: string){
        super(scope,id);

        this.productTable = this.createProductTable();
        this.cartTable = this.createCartTable();
       
    }

    // Refactoring
    // Improving the Design of Existing Code
    // By Martin Fowler · 2019
    private createCartTable() : ITable{
        // product table
        // product: PK - id -- name - description - imageFile - price - category
        const cartTable = new Table(this, 'cart',{
            partitionKey: {name: 'username', type: AttributeType.STRING},
            tableName: "cart",
            removalPolicy: RemovalPolicy.DESTROY, // for cdk destroy
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        return cartTable
    }
    private createProductTable(): ITable{
        // cart table
        // cart id-username - cartItemLits[] - every user has one cart
        // items (SET-MAP object)
        // item1 - {quantity - color - price - productId - productName}
        const productTable = new Table(this, 'product',{
            partitionKey: {name: 'id', type: AttributeType.STRING},
            tableName: "product",
            removalPolicy: RemovalPolicy.DESTROY, // for cdk destroy
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        return productTable;
    }
}