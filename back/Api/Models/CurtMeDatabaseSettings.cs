namespace Curtme.Models
{
    public class CurtMeDatabaseSettings : ICurtMeDatabaseSettings
    {
        public string LinksCollectionName { get; set; }
        public string LinkDetailsCollectionName { get; set; }
        public string UsersCollectionName { get; set; }
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
    }

    public interface ICurtMeDatabaseSettings
    {
        string LinksCollectionName { get; set; }
        string LinkDetailsCollectionName { get; set; }
        string UsersCollectionName { get; set; }
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }
}