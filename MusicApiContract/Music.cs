namespace MusicParty.MusicApi
{
    public record Music(string Apiname, string Id, string Name, string[] Artists, string ImgUrl)
    {
        // 构造函数，带有默认封面图片的处理逻辑
        public Music(string Apiname, string Id, string Name, string[] Artists)
    : this(Apiname, Id, Name, Artists, null)
        {
        }
    }
}