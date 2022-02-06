using System;
using System.Linq;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;

namespace Curtme.Filters
{
    public class LinkLockedActionFilter : ActionFilterAttribute
    {
        private readonly string baseURL;

        private readonly LinkService linkService;

        public LinkLockedActionFilter(IConfiguration configuration, LinkService linkService)
        {
            this.baseURL = configuration["FrontEnd:URL"];

            this.linkService = linkService;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var shortURL = context.ModelState.Values.SingleOrDefault();

            if (shortURL != null)
            {
                var link = this.linkService.GetByShortURL(shortURL.AttemptedValue);

                if (link != null && link.HasPassword)
                {
                    context.Result = new RedirectResult(this.GetRedirectURL(link));
                }
            }

            base.OnActionExecuting(context);
        }

        private String GetRedirectURL(Link link)
        {
            return $"{baseURL}/#/unlock/{link.ShortURL}";
        }
    }
}