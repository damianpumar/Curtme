using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
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

            this.linkDetailsService.Save(linkIn, remoteIp);

            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public Link GetByShortURL(String shortURL)
        {
            return this.mongoDBService.Links.Find<Link>(link => link.ShortURL == shortURL).SingleOrDefault();
        }

        public Link GetById(String linkId)
        {
            return this.mongoDBService.Links.Find<Link>(link => link.Id == linkId).SingleOrDefault();
        }

        public IEnumerable<Link> GetByIds(String[] ids)
        {
            return this.mongoDBService.Links.Find<Link>(link => ids.Contains(link.Id)).ToList();
        }

        public IEnumerable<Link> GetAll(String userId)
        {
            return this.mongoDBService.Links.Find<Link>(link => link.UserId == userId).ToList();
        }

        public IEnumerable<Link> Find(Expression<Func<Link, Boolean>> findQuery)
        {
            return this.mongoDBService.Links.Find<Link>(findQuery).ToList();
        }

        public Boolean ExistByShortURL(String shortURL)
        {
            return this.mongoDBService.Links.Find<Link>(link => link.ShortURL == shortURL).Any();
        }

        public void Update(String linkId, String userId)
        {
            var linkIn = this.mongoDBService.Links.Find<Link>(link => link.Id == linkId).Single();

            linkIn.UserId = userId;

            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public void Update(Link linkIn)
        {
            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        public void Customize(Link linkIn, String newShortURL)
        {
            linkIn.ShortURL = newShortURL;

            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        private string CreateShortURL()
        {
            var shortURL = RandomExtensions.Create(7);

            if (this.ExistByShortURL(shortURL))
                return this.CreateShortURL();

            return shortURL;
        }
    }
}