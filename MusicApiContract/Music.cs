namespace MusicParty.MusicApi
{
    public record Music(string Apiname, string Id, string Name, string[] Artists, string ImgUrl)
    {
        // ���캯��
        public Music(string Apiname, string Id, string Name, string[] Artists)
            : this(Apiname, Id, Name, Artists, null) // Ĭ�Ͻ� ImgUrl ����Ϊ null
        {
        }
    }
}