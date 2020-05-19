using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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

        public Link Create(String longURL, String title, String userId = null)
        {
            var shortURL = this.CreateShortURL();

            var link = new Link(longURL, shortURL, title, userId);

            this.links.InsertOne(link);

            return link;
        }

        public void Visited(Link linkIn)
        {
            linkIn.Visited++;

            this.links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public Link GetByShortURL(String shortURL)
        {
            return this.links.Find<Link>(link => link.ShortURL == shortURL).SingleOrDefault();
        }

        public IEnumerable<Link> GetById(String[] ids)
        {
            return this.links.Find<Link>(link => ids.Contains(link.Id)).ToList();
        }

        public IEnumerable<Link> GetAll(string userId)
        {
            return this.links.Find<Link>(link => link.UserId == userId).ToList();
        }

        public IEnumerable<Link> Find(Expression<Func<Link, Boolean>> findQuery)
        {
            return this.links.Find<Link>(findQuery).ToList();
        }

        public Boolean Exist(String shortURL)
        {
            return this.links.Find<Link>(link => link.ShortURL == shortURL).Any();
        }

        public void Update(string id, string userId)
        {
            var linkIn = this.links.Find<Link>(link => link.Id == id).Single();
            linkIn.UserId = userId;

            this.links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public void Update(Link linkIn)
        {
            this.links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
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