using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Curtme.Extensions
{
    public static class Auth0Extensions
    {
        public static void AddAuth0(this IServiceCollection services)
        {
            services.AddAuthentication(options =>
           {
               options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
               options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
           })
           .AddJwtBearer(options =>
           {
               options.Authority = "https://dev-6r8s11fz.eu.auth0.com/";
               options.Audience = "https://dev-6r8s11fz.eu.auth0.com/api/v2/";
               options.RequireHttpsMetadata = false;
               options.TokenValidationParameters = new TokenValidationParameters
               {
                   NameClaimType = ClaimTypes.NameIdentifier,
               };
           });
        }

        public static string GetId(this ClaimsPrincipal principal)
        {
            if (principal != null)
            {
                return principal.Identity.Name;
            }

            return null;
        }
    }
}