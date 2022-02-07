using Microsoft.AspNetCore.Mvc.Filters;

namespace Curtme.Extensions
{
    public static class ActionDescriptorExtensions
    {
        public static T GetArgumentOfType<T>(this ActionExecutingContext context)
        where T : class
        {
            foreach (var argument in context.ActionArguments)
            {
                var linkDto = argument.Value as T;

                if (linkDto != null) return linkDto;
            }

            return null;
        }
    }
}