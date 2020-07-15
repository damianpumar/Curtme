using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Curtme.Filters
{
    public class ClientIpCheckActionFilter : ActionFilterAttribute
    {
        private readonly string safeList;

        public ClientIpCheckActionFilter(string safelist)
        {
            this.safeList = safelist;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var remoteIp = context.HttpContext.Connection.RemoteIpAddress;

            if (remoteIp.IsIPv4MappedToIPv6)
            {
                remoteIp = remoteIp.MapToIPv4();
            }

            var safeIps = safeList.Split(';');

            if(!safeIps.Any(ip=> ip == remoteIp.ToString()))
            {
                context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            }

            base.OnActionExecuting(context);
        }
    }
}