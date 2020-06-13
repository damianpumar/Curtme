using System.Net;
using IpStack;
using IpStack.Models;
using Microsoft.Extensions.Configuration;

namespace Curtme.Services
{
    public class IpStackService
    {
        private readonly IpStackClient client;

        public IpStackService(IConfiguration configuration)
        {
            this.client = new IpStackClient(configuration["IpStack:Key"]);
        }

        public IpAddressDetails GetData(IPAddress remoteIp)
        {
#if DEBUG
            var ip = "2.155.39.153"; remoteIp.ToString();
#else
            var ip = remoteIp.ToString();
#endif

            return client.GetIpAddressDetails(ip);
        }
    }
}