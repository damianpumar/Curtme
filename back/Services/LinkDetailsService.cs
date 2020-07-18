using System;
using System.Collections.Generic;
using System.Net;
using Curtme.Models;
using MongoDB.Driver;

namespace Curtme.Services
{
    public class LinkDetailsService
    {
        private readonly MongoDBService mongoDBService;

        private readonly IpStackService ipStackService;

        public LinkDetailsService(MongoDBService mongoDBService, IpStackService ipStackService)
        {
            this.mongoDBService = mongoDBService;

            this.ipStackService = ipStackService;
        }
        
        public void CreatePosition(Link link, IPAddress remoteIp)
        {
            try
            {
                var ipStack = this.ipStackService.GetData(remoteIp);

                var detail = new LinkDetails(link)
                {
                    Ip = ipStack.Ip,
                    ContinentName = ipStack.ContinentName,
                    CountryCode = ipStack.CountryCode,
                    CountryName = ipStack.CountryName,
                    RegionCode = ipStack.RegionCode,
                    RegionName = ipStack.RegionName,
                    City = ipStack.City,
                    Latitude = ipStack.Latitude,
                    Longitude = ipStack.Longitude,
                    CountryEmoji = ipStack.Location.CountryFlagEmoji,
                    Date = DateTime.UtcNow,
                };

                this.mongoDBService.LinkDetails.InsertOne(detail);
            }
            catch (System.Exception)
            {
                // TODO: Log error
            }
        }

        public IEnumerable<LinkDetails> GetDetails(String linkId)
        {
            return this.mongoDBService.LinkDetails.Find<LinkDetails>(detail => detail.LinkId == linkId).ToList();
        }
    }
}