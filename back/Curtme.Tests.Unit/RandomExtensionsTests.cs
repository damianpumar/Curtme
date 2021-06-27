using Curtme.Extensions;
using Xunit;

namespace Curtme.Tests.Unit
{
    public class RandomExtensionsTests
    {
        public class Method_Create_Should
        {
            [Fact]
            public void Get_Different_String_Each_Invocation()
            {
                var random = RandomExtensions.Create();

                var otherRandom = RandomExtensions.Create();

                Assert.NotEqual(random, otherRandom);
            }
        }
    }
}