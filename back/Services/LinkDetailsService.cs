using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Net;
using Curtme.Models;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using Wangkanai.Detection.Services;

namespace Curtme.Services
{
    public class LinkDetailsService
    {
        private readonly MongoDBService mongoDBService;

        private readonly GeoLocationService geolocationService;

        private readonly IDetectionService detectionService;

        private readonly IHttpContextAccessor httpContextAccessor;

        public LinkDetailsService(MongoDBService mongoDBService,
                                    GeoLocationService geolocationService,
                                    IDetectionService detectionService,
                                    IHttpContextAccessor httpContextAccessor
        )
        {
            this.mongoDBService = mongoDBService;

            this.geolocationService = geolocationService;

            this.detectionService = detectionService;

            this.httpContextAccessor = httpContextAccessor;
        }

        public void Save(Link link)
        {
            try
            {
                var ipAddress = this.httpContextAccessor.HttpContext.Connection.RemoteIpAddress;

                var geoLocation = this.geolocationService.GetData(ipAddress);

                var detail = new LinkDetails(link)
                {
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