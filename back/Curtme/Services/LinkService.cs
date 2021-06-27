using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Curtme.Extensions;
using Curtme.Models;
using MongoDB.Driver;
using Wangkanai.Detection.Services;

namespace Curtme.Services
{
    public class LinkService
    {
        private readonly MongoDBService mongoDBService;

        private readonly LinkDetailsService linkDetailsService;

        private readonly IDetectionService detectionService;

        public LinkService(MongoDBService mongoDBService,
                           LinkDetailsService linkDetailsService,
                           IDetectionService detectionService)
        {
            this.mongoDBService = mongoDBService;

            this.linkDetailsService = linkDetailsService;

            this.detectionService = detectionService;
        }

        public Link Create(String sourceURL, String title, String userId = null)
        {
            var shortURL = this.CreateShortURL();

            var link = new Link(sourceURL, shortURL, title, userId);

            this.mongoDBService.Links.InsertOne(link);

            return link;
        }

        public void Visit(Link linkIn, RequestInfo requestInfo)
        {
            if (!this.detectionService.Crawler.IsCrawler)
            {
                Task.Run(() =>
                {
                    linkIn.Visited++;

                    this.linkDetailsService.Save(linkIn, requestInfo);

                    this.Update(linkIn);
                });
            }
        }

        public Link GetByShortURL(String shortURL)
        {
            return this.mongoDBService.Links.Find<Link>(link => !link.Deleted && link.ShortURL == shortURL).SingleOrDefault();
        }

        public Link GetById(String linkId)
        {
            return this.mongoDBService.Links.Find<Link>(link => !link.Deleted && link.Id == linkId).SingleOrDefault();
        }

        public IEnumerable<Link> GetByIds(String[] ids)
        {
            return this.mongoDBService.Links.Find<Link>(link => !link.Deleted && ids.Contains(link.Id)).ToList();
        }

        public IEnumerable<Link> GetAll(String userId)
        {
            return this.mongoDBService.Links.Find<Link>(link => !link.Deleted && link.UserId == userId).ToList();
        }

        public Boolean ExistByShortURL(String shortURL)
        {
            return this.mongoDBService.Links.Find<Link>(link => !link.Deleted && link.ShortURL == shortURL).Any();
        }

        public void SyncToUser(String linkId, String userId)
        {
            var linkIn = this.mongoDBService.Links.Find<Link>(link => link.Id == linkId).Single();

            linkIn.UserId = userId;

            this.Update(linkIn);
        }

        public void Delete(Link linkIn)
        {
            linkIn.Deleted = true;

            this.Update(linkIn);
        }

        public void Update(Link linkIn)
        {
            this.mongoDBService.Links.ReplaceOne(link => link.Id == linkIn.Id, linkIn);
        }

        private string CreateShortURL()
        {
            var shortURL = RandomExtensions.Create();

            if (this.ExistByShortURL(shortURL))
                return this.CreateShortURL();

            return shortURL;
        }
    }
}