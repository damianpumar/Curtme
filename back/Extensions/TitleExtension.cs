using System;
using HtmlAgilityPack;

namespace Curtme.Extensions
{
    public static class TitleExtension
    {
        public static Boolean TryGetTitle(this String url, out String title)
        {
            if (url.IsValidWebSite())
                return GetWebsiteTitle(url, out title);

            return GetDefaultUnknownURL(url, out title);

        }

        private static Boolean GetDefaultUnknownURL(String url, out string title)
        {
            title = url;

            return true;
        }

        private static Boolean GetWebsiteTitle(String url, out String title)
        {
            try
            {
                var webGet = new HtmlWeb();

                var document = webGet.Load(url);

                title = document.DocumentNode.SelectSingleNode("html/head/title").InnerText;

                return true;
            }
            catch (Exception)
            {
                title = null;

                return false;
            }
        }
    }
}