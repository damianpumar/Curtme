using System;
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

        public Link Get(String shortURL) => this.links.Find<Link>(link => link.ShortURL == shortURL).FirstOrDefault();

        public Link Create(String longURL)
        {
            var link = new Link(longURL);
            link.ShortURL = this.CreateShortURL();

            this.links.InsertOne(link);

            return link;
        }

        public void Visited(Link linkIn)
        {
            linkIn.Visited++;

            this.links.ReplaceOne(link => link.ShortURL == linkIn.ShortURL, linkIn);
        }

        private string CreateShortURL()
        {
            var shortURL = RandomShortURL.Create(7);

            var link = this.Get(shortURL);

            if (link != null)
                return this.CreateShortURL();

            return shortURL;
        }
    }
}