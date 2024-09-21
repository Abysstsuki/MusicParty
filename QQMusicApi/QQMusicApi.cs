using System.Text.Json.Nodes;

namespace MusicParty.MusicApi.QQMusic;

public class QQMusicApi : IMusicApi
{
    private readonly string _url;
    private readonly HttpClient _http = new HttpClient(new HttpClientHandler() { UseCookies = false });

    public QQMusicApi(string url, string cookie)
    {
        _url = url;
        Console.WriteLine("You are going to login your QQ music account using cookie...");
        Login(cookie).Wait();
        Console.WriteLine("Login success.");
    }

    private async Task Login(string cookie)
    {
        if (string.IsNullOrEmpty(cookie))
            throw new LoginException("Set your cookie in appsettings.json");
        if (!await CheckCookieAsync(cookie))
            throw new LoginException("Login failed, check your cookie.");
        _http.DefaultRequestHeaders.Add("Cookie", cookie);
    }

    private async Task<bool> CheckCookieAsync(string cookie)
    {
        var http = new HttpClient();
        http.DefaultRequestHeaders.Add("Cookie", cookie);
        var resp = await http.GetStringAsync($"{_url}/recommend/daily");
        var j = JsonNode.Parse(resp)!;
        return j["result"]!.GetValue<int>() != 301;
    }

    public string ServiceName => "QQMusic";

    public async Task<bool> TrySetCredentialAsync(string cred)
    {
        if (await CheckCookieAsync(cred))
        {
            _http.DefaultRequestHeaders.Remove("Cookie");
            _http.DefaultRequestHeaders.Add("Cookie", cred);
            return true;
        }
        else
            return false;
    }

    // public async Task<Music> GetMusicByIdAsync(string id)
    // {
    //     var resp = await _http.GetStringAsync(_url + $"/song?songmid={id}");
    //     var j = JsonNode.Parse(resp)!;
    //     if (j["result"]!.GetValue<int>() != 100)
    //         throw new Exception($"Unable to get music, message: {resp}");

    //     var trackInfo = j["data"]!["track_info"]!;
    //     var name = trackInfo["name"]!.GetValue<string>();
    //     var ar = trackInfo["singer"]!.AsArray()
    //         .Select(x => x!["name"]!.GetValue<string>()).ToArray();
    //     // 提取专辑mid并构建封面图片路径
    //     var albumMid = trackInfo["album"]!["mid"]!.GetValue<string>();
    //     var imgUrl = $"https://y.qq.com/music/photo_new/T002R300x300M000{albumMid}.jpg";

    //     return new Music("QQ", id, name, ar, imgUrl);
    // }
    public async Task<Music> GetMusicByIdAsync(string id)
    {
        var resp = await _http.GetStringAsync(_url + $"/song?songmid={id}");
        var j = JsonNode.Parse(resp)!;
        if (j["result"]!.GetValue<int>() != 100)
            throw new Exception($"Unable to get music, message: {resp}");

        var trackInfo = j["data"]!["track_info"]!;
        var name = trackInfo["name"]!.GetValue<string>();
        var ar = trackInfo["singer"]!.AsArray()
            .Select(x => x!["name"]!.GetValue<string>()).ToArray();

        // 添加安全的空值检查
        var album = trackInfo["album"];
        string imgUrl = null;
        if (album != null && album["mid"] != null)
        {
            var albumMid = album["mid"]!.GetValue<string>();
            imgUrl = $"https://y.qq.com/music/photo_new/T002R300x300M000{albumMid}.jpg";
        }
        else
        {
            imgUrl = "default_image_url"; // 提供一个默认的封面图片URL
        }

        return new Music("QQ", id, name, ar, imgUrl);
    }



    // public async Task<PlayableMusic> GetPlayableMusicAsync(Music music)
    // {
    //     var ids = music.Id.Split(',');
    //     var resp1 = await _http.GetStringAsync(_url + $"/song?songmid={ids[0]}");
    //     var j1 = JsonNode.Parse(resp1)!;
    //     if (j1["result"]!.GetValue<int>() != 100)
    //         throw new Exception($"Unable to get playable music, message: {resp1}");
    //     var length = j1["data"]!["track_info"]!["interval"]!.GetValue<int>() * 1000;
    //     string url;
    //     var resp2 = await _http.GetStringAsync(_url + $"/song/url?id={ids[0]}&mediaId={ids[1]}&type=320");
    //     var j2 = JsonNode.Parse(resp2)!;
    //     if (j2["result"]!.GetValue<int>() != 100 || string.IsNullOrEmpty(j2["data"]!.GetValue<string>()))
    //     {
    //         var resp3 = await _http.GetStringAsync(_url +
    //                                                $"/song/url?id={ids[0]}&mediaId={ids[1]}"); // no 320 mp3, try 128
    //         var j3 = JsonNode.Parse(resp3)!;
    //         if (j3["result"]!.GetValue<int>() != 100 || string.IsNullOrEmpty(j3["data"]!.GetValue<string>()))
    //             throw new Exception($"Unable to get playable music, message: {resp2}");
    //         url = j3["data"]!.GetValue<string>();
    //     }
    //     else
    //         url = j2["data"]!.GetValue<string>();

    //     return new PlayableMusic(music) { Url = url.Replace("http", "https"), Length = length };
    // }


    public async Task<PlayableMusic> GetPlayableMusicAsync(Music music)
    {
        // 前端只传入一个参数，因此直接使用 music.Id 而不进行分割
        var id = music.Id; // 假设传入的参数是 songmid

        // 让 songmid 和 mediaId 都等于传入的参数 id
        var songmid = id;
        var mediaId = id;

        // 请求歌曲信息
        var resp1 = await _http.GetStringAsync(_url + $"/song?songmid={songmid}");
        var j1 = JsonNode.Parse(resp1)!;
        if (j1["result"]!.GetValue<int>() != 100)
            throw new Exception($"Unable to get playable music, message: {resp1}");

        // 获取时长信息
        var length = j1["data"]!["track_info"]!["interval"]!.GetValue<int>() * 1000;

        string url;

        // 请求播放链接，使用 songmid 和 mediaId（它们是相同的）
        var resp2 = await _http.GetStringAsync(_url + $"/song/url?id={songmid}&mediaId={mediaId}&type=320");
        var j2 = JsonNode.Parse(resp2)!;
        if (j2["result"]!.GetValue<int>() != 100 || string.IsNullOrEmpty(j2["data"]!.GetValue<string>()))
        {
            var resp3 = await _http.GetStringAsync(_url + $"/song/url?id={songmid}&mediaId={mediaId}"); // no 320 mp3, try 128
            var j3 = JsonNode.Parse(resp3)!;
            if (j3["result"]!.GetValue<int>() != 100 || string.IsNullOrEmpty(j3["data"]!.GetValue<string>()))
                throw new Exception($"Unable to get playable music, message: {resp2}");
            url = j3["data"]!.GetValue<string>();
        }
        else
        {
            url = j2["data"]!.GetValue<string>();
        }

        // 返回 PlayableMusic 对象
        return new PlayableMusic(music) { Url = url.Replace("http", "https"), Length = length };
    }



    public async Task<IEnumerable<MusicServiceUser>> SearchUserAsync(string keyword)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<PlayList>> GetUserPlayListAsync(string userIdentifier)
    {
        var resp1 = await _http.GetStringAsync(_url + $"/user/songlist?id={userIdentifier}");
        var j1 = JsonNode.Parse(resp1)!;
        if (j1["result"]!.GetValue<int>() != 100)
            throw new Exception($"Unable to get user playlist, message: ${resp1}");
        var playlists1 = j1["data"]!["list"]!.AsArray()
            .Select(x => new PlayList(
                x!["tid"]!.GetValue<long>().ToString(),
                x!["diss_name"]!.GetValue<string>())).Where(x => x.Id != "0");

        var resp2 = await _http.GetStringAsync(_url + $"/user/collect/songlist?id={userIdentifier}");
        var j2 = JsonNode.Parse(resp2)!;
        if (j2["result"]!.GetValue<int>() != 100)
            throw new Exception($"Unable to get user collected playlist, message: ${resp2}");
        var playlists2 = j2["data"]!["list"]!.AsArray()
            .Select(x => new PlayList(
                x!["dissid"]!.GetValue<long>().ToString(),
                x!["dissname"]!.GetValue<string>()));

        return playlists1.Concat(playlists2);
    }

    public async Task<IEnumerable<Music>> GetMusicsByPlaylistAsync(string id, int offset = 0)
    {
        // 第一步：获取歌单的基础信息
        var resp = await _http.GetStringAsync(_url + $"/songlist?id={id}");
        var j = JsonNode.Parse(resp)!;
        if (j["result"]!.GetValue<int>() != 100)
            throw new Exception($"Unable to get playlist musics, message: {resp}");

        // 第二步：从歌单返回的结果中提取歌曲ID、名称、艺术家和封面图片
        var musics = j["data"]!["songlist"]!.AsArray()
            .Select(x =>
            {
                var artists = x!["singer"]!.AsArray().Select(y => y!["name"]!.GetValue<string>()).ToArray();
                string imgUrl = null;

                // 获取 albummid 并构造封面图片URL
                var albumMid = x["albummid"]?.GetValue<string>();
                imgUrl = $"https://y.qq.com/music/photo_new/T002R300x300M000{albumMid}.jpg";


                return new Music("QQMusic",
                    x["songmid"]!.GetValue<string>(),   // 歌曲ID
                    x["songorig"]!.GetValue<string>(),  // 歌曲名称
                    artists,                            // 歌手信息
                    imgUrl                              // 封面图片URL
                );
            });

        // 返回分页结果
        return musics.Skip(offset).Take(10);
    }

    public async Task<IEnumerable<Music>> SearchMusicByNameAsync(string name, int offset = 0)
    {
        // 调用 QQ 音乐的搜索接口
        var resp = await _http.GetStringAsync(_url + $"/search?key={name}");
        var j = JsonNode.Parse(resp)!;

        // 判断返回的 result 是否成功
        if (j["result"]!.GetValue<int>() != 100)
            throw new Exception($"Unable to search music, message: {resp}");

        // 从搜索结果中提取歌曲ID、名称、艺术家信息
        var basicSongs = from song in j["data"]!["list"]!.AsArray()
                         let id = song["songmid"].GetValue<string>()
                         let songName = song["songname"].GetValue<string>()
                         let artists = song["singer"]!.AsArray().Select(artist => artist!["name"]!.GetValue<string>()).ToArray()
                         select new { id, songName, artists };

        // 并行调用 GetMusicByIdAsync 来获取详细信息（包括封面图片）
        var detailedSongs = await Task.WhenAll(basicSongs.Select(async song =>
        {
            try
            {
                // 调用获取单个歌曲的接口来获取详细信息
                return await GetMusicByIdAsync(song.id);
            }
            catch (Exception ex)
            {
                // 处理调用失败的情况，返回一个基础信息的音乐对象
                return new Music("QQMusic", song.id, song.songName, song.artists, string.Empty);
            }
        }));

        return detailedSongs;
    }
}