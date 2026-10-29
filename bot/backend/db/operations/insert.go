package operations

import (
	"context"
	"project/db"

	"go.mongodb.org/mongo-driver/bson"
)

func Insert(ctx context.Context, data map[string]interface{}) error {
	client := db.GetClient()
	collection := client.Database("db").Collection("users")

	_, err := collection.InsertOne(ctx, bson.M(data))
	return err
}
