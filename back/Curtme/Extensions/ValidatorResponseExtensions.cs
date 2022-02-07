using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace Curtme.Extensions
{
    public static class ValidatorResponseExtensions
    {
        public static IMvcBuilder AddCustomValidatorResponse(this IMvcBuilder builder)
        {
            builder.ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = (context =>
                {
                    var error = string.Join(Environment.NewLine, context.ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));

                    return new BadRequestObjectResult(new { error = error });
                });
            });

            return builder;
        }
    }
}