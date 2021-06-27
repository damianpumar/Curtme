using Curtme.Models;
using MongoDB.Driver;

namespace Curtme.Services
{
    public class MongoDBService
    {
        public IMongoCollection<Link> Links { get; }

        public IMongoCollection<LinkDetails> LinkDetails { get; }

        public IMongoCollection<User> Users { get; }

        public MongoDBService(ICurtMeDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);

            this.Links = database.GetCollection<Link>(settings.LinksCollectionName);
            this.LinkDetails = database.GetCollection<LinkDetails>(settings.LinkDetailsCollectionName);
            this.Users = database.GetCollection<User>(settings.UsersCollectionName);
        }
    }
}