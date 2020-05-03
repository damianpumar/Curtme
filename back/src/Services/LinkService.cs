using System;
using System.Collections.Generic;
using Curtme.Extensions;
using Curtme.Models;
using MongoDB.Driver;

namespace Curtme.Services
{
    public class LinkService
    {
        private readonly IMongoCollection<Link> links;

        public LinkService(ICurtMeDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);

            this.links = database.GetCollection<Link>(settings.LinksCollectionName);
        }

        public Link Create(String longURL, String userId = null)
        {
            var link = new Link(longURL, userId);
            link.ShortURL = this.CreateShortURL();

            this.links.InsertOne(link);

            return link;
        }

        public void Visited(Link linkIn)
        {
            linkIn.Visited++;

            this.links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public Link Get(String id)
        {
            return this.links.Find<Link>(link => link.Id == id).FirstOrDefault();
        }

        public IEnumerable<Link> GetAll(string userId)
        {
            return this.links.Find<Link>(link => link.UserId == userId).ToList();
        }

        public Boolean Exist(String shortURL)
        {
            return this.links.Find<Link>(link => link.ShortURL == shortURL).Any();
        }

        private string CreateShortURL()
        {
            var shortURL = RandomExtensions.Create(7);

            if (this.Exist(shortURL))
                return this.CreateShortURL();

            return shortURL;
        }
    }
}