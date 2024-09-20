namespace MusicParty.MusicApi
{
    public record Music(string Apiname, string Id, string Name, string[] Artists, string ImgUrl)
    {
        // 构造函数
        public Music(string Apiname, string Id, string Name, string[] Artists)
            : this(Apiname, Id, Name, Artists, null) // 默认将 ImgUrl 设置为 null
        {
        }
    }
}