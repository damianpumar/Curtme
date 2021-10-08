using Curtme.Extensions;
using Xunit;

namespace Curtme.Tests.Unit
{
    public class UrlExtensionsTests
    {
        public class Method_GetDomainName_Should
        {
            [Fact]
            public void Get_Null_If_Send_Null_As_Argument()
            {
                var domainName = UrlExtensions.GetDomainName(null);

                Assert.Null(domainName);
            }

            [Fact]
            public void Get_Null_If_Send_Invalid_URL()
            {
                var domainName = UrlExtensions.GetDomainName("zzz");

                Assert.Null(domainName);
            }

            [Fact]
            public void Get_Google_If_The_URL_Is_www_google_com()
            {
                var domainName = UrlExtensions.GetDomainName("https://www.google.com");

                Assert.Equal("Google.com", domainName);
            }

            [Fact]
            public void Get_Google_If_The_URL_Is_www_mail_google_com_ar()
            {
                var domainName = UrlExtensions.GetDomainName("https://www.mail.google.com.ar");

                Assert.Equal("Mail.google.com.ar", domainName);
            }
        }
    }
}
