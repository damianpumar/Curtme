using System;
using System.Collections.Generic;
using Curtme.Extensions;
using Curtme.Models;
using MongoDB.Driver;
using Wangkanai.Detection.Services;

namespace Curtme.Services
{
    public class LinkDetailsService
    {
        private readonly MongoDBService mongoDBService;

        private readonly GeoLocationService geolocationService;

        private readonly IDetectionService detectionService;

        public LinkDetailsService(MongoDBService mongoDBService,
                                    GeoLocationService geolocationService,
                                    IDetectionService detectionService
        )
        {
            this.mongoDBService = mongoDBService;

            this.geolocationService = geolocationService;

            this.detectionService = detectionService;
        }

        public void Save(Link link, RequestInfo requestInfo)
        {
            try
            {
                var geoLocation = this.geolocationService.GetData(requestInfo.IpAddress);

                var detail = new LinkDetails(link)
                {
                    Language = requestInfo.Language,
                    Ip = geoLocation.GetIPAddress(),
                    ISP = geoLocation.GetISP(),
                    ContinentName = geoLocation.GetContinentName(),
                    CountryCode = geoLocation.GetCountryCapital(),
                    CountryName = geoLocation.GetCountryName(),
                    ZipCode = geoLocation.GetZipCode(),
                    City = geoLocation.GetCity(),
                    Latitude = Double.Parse(geoLocation.GetLatitude()),
                    Longitude = Double.Parse(geoLocation.GetLongitude()),
                    CountryEmoji = geoLocation.GetCountryFlag(),
                    Date = DateTime.UtcNow,
                    Host = requestInfo.ReferrerDomain,
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