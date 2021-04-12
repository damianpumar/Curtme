using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Curtme.Extensions
{
    public static class Auth0Extensions
    {
        public static void AddAuth0(this IServiceCollection services)
        {
            var configuration = (IConfiguration)services.BuildServiceProvider().GetService(typeof(IConfiguration));

            var userService = (UserService)services.BuildServiceProvider().GetService(typeof(UserService));

            services.AddAuthentication(options =>
               {
                   options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                   options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
               })
               .AddJwtBearer(options =>
               {
                   options.Authority = configuration["Auth0:Authority"];
                   options.Audience = configuration["Auth0:Audience"];

                   options.RequireHttpsMetadata = false;
                   options.TokenValidationParameters = new TokenValidationParameters
                   {
                       NameClaimType = ClaimTypes.NameIdentifier,
                       ClockSkew = TimeSpan.FromMinutes(5)
                   };
                   options.SaveToken = true;
                   options.Events = new JwtBearerEvents()
                   {
                       OnTokenValidated = context =>
                       {
                           Task.Run(() =>
                             {
                                 var accessToken = context.SecurityToken as JwtSecurityToken;

                                 if (accessToken != null)
                                 {
                                     ClaimsIdentity identity = context.Principal.Identity as ClaimsIdentity;

                                     if (identity != null)
                                     {
                                         var user = userService.GetUserById(context.Principal.Identity.Name);

                                         if (user == null)
                                         {
                                             user = new User()
                                             {
                                                 Id = context.Principal.GetId(),
                                                 Plan = "Free"
                                             };

                                             userService.CreateUser(user);
                                         }

                                         identity.AddClaim(new Claim("plan", user.Plan));
                                     }
                                 }
                             });

                           return Task.CompletedTask;
                       }
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