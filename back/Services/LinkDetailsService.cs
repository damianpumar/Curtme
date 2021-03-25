using System;
using System.Collections.Generic;
using System.Net;
using Curtme.Models;
using MongoDB.Driver;
using Wangkanai.Detection.Services;

namespace Curtme.Services
{
    public class LinkDetailsService
    {
        private readonly MongoDBService mongoDBService;

        private readonly IpStackService ipStackService;

        private readonly IDetectionService detectionService;

        public LinkDetailsService(MongoDBService mongoDBService, IpStackService ipStackService, IDetectionService detectionService)
        {
            this.mongoDBService = mongoDBService;

            this.ipStackService = ipStackService;

            this.detectionService = detectionService;
        }

        public void Save(Link link, IPAddress remoteIp)
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
                    Host = this.detectionService.Crawler.Name.ToString(),
                    Platform = this.detectionService.Platform.Name.ToString(),
                    PlatformVersion = this.detectionService.Platform.Version.ToString(),
                    Browser = this.detectionService.Browser.Name.ToString(),
                    BrowserVersion = this.detectionService.Browser.Version.ToString(),
                    Device = this.detectionService.Device.Type.ToString(),
                    Engine = this.detectionService.Engine.Name.ToString()
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