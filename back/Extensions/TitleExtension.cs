using System;
using System.Text;
using HtmlAgilityPack;

namespace Curtme.Extensions
{
    public static class TitleExtension
    {
        public static String GetTitle(this String url)
        {
            try
            {
                var webGet = new HtmlWeb();
                webGet.OverrideEncoding = Encoding.UTF8;
                var document = webGet.Load(url);

                return document.DocumentNode.SelectSingleNode("html/head/title").InnerText;
            }
            catch (Exception)
            {
                Uri.TryCreate(url, UriKind.Absolute, out var uriResult);

                if(String.IsNullOrEmpty(uriResult.Host))
                    return url;

                return uriResult.Host;
            }
        }
    }
}