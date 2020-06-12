using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Threading.Tasks;
using Curtme.Extensions;
using Curtme.Models;
using MongoDB.Driver;

namespace Curtme.Services
{
    public class LinkService
    {
        private readonly MongoDBService mongoDBService;

        private readonly LinkDetailsService linkDetailsService;

        public LinkService(MongoDBService mongoDBService, LinkDetailsService linkDetailsService)
        {
            this.mongoDBService = mongoDBService;

            this.linkDetailsService = linkDetailsService;
        }

        public Link Create(String longURL, String title, String userId = null)
        {
            var shortURL = this.CreateShortURL();

            var link = new Link(longURL, shortURL, title, userId);

            this.mongoDBService.Links.InsertOne(link);

            return link;
        }

        public void Visited(Link linkIn, IPAddress remoteIp)
        {
            linkIn.Visited++;

            this.linkDetailsService.CreatePosition(linkIn, remoteIp);

            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public Link GetByShortURL(String shortURL)
        {
            return this.mongoDBService.Links.Find<Link>(link => link.ShortURL == shortURL).SingleOrDefault();
        }

        public IEnumerable<Link> GetById(String[] ids)
        {
            return this.mongoDBService.Links.Find<Link>(link => ids.Contains(link.Id)).ToList();
        }

        public IEnumerable<Link> GetAll(string userId)
        {
            return this.mongoDBService.Links.Find<Link>(link => link.UserId == userId).ToList();
        }

        public IEnumerable<Link> Find(Expression<Func<Link, Boolean>> findQuery)
        {
            return this.mongoDBService.Links.Find<Link>(findQuery).ToList();
        }

        public Boolean Exist(String shortURL)
        {
            return this.mongoDBService.Links.Find<Link>(link => link.ShortURL == shortURL).Any();
        }

        public void Update(string id, string userId)
        {
            var linkIn = this.mongoDBService.Links.Find<Link>(link => link.Id == id).Single();
            linkIn.UserId = userId;

            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public void Update(Link linkIn)
        {
            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
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