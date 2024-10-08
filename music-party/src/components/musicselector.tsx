import {
  Flex,
  Input,
  Button,
  useToast,
  Select,
  Text,
  Stack,
  Box,
  Image,
  List,
  ListItem,
  Divider,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Connection } from "../api/musichub"; // 确保正确导入 API
import { searchMusicByName } from "../api/api";
import { toastEnqueueOk, toastError } from "../utils/toast";
import { DeleteIcon, TriangleUpIcon } from "@chakra-ui/icons"; // 添加必要的图标

interface Music {
  id: string;
  name: string;
  artists: string[];
  imgUrl: string; // 添加封面URL
}

export const MusicSelector = (props: { apis: string[]; conn: Connection }) => {
  const [id, setId] = useState("");
  const [apiName, setApiName] = useState(props.apis[0] || "");
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Music[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // 当前页码
  const itemsPerPage = 10; // 每页显示的条数
  const t = useToast();

  useEffect(() => {
    setApiName(props.apis[0]);
  }, [props.apis]);

  const handleSearch = async () => {
    if (keyword.trim() === "") return;
    setLoading(true);
    try {
      //const results = await searchMusicByName(keyword, "NeteaseCloudMusic"); // 确保此函数已导出
      const results = await searchMusicByName(keyword, apiName); // 确保此函数已导出
      setSearchResults(results);
      setPage(1); // 搜索后重置为第一页
    } catch (e) {
      toastError(t, "搜索音乐失败");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 计算当前页要展示的数据
  const currentPageData = searchResults.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(searchResults.length / itemsPerPage); // 计算总页数

  return (
    <>
      <Flex flexDirection={"row"} alignItems={"center"} mb={4}>
        <Text>选择平台</Text>
        <Select ml={2} flex={1} onChange={(e) => setApiName(e.target.value)}>
          {props.apis.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </Flex>

      <Flex flexDirection={"row"} mb={4}>
        <Input
          flex={1}
          type={"text"}
          value={id}
          placeholder={"输入音乐 ID"}
          onChange={(e) => setId(e.target.value)}
        />
        <Button
          ml={2}
          onClick={() => {
            if (id.length > 0)
              props.conn
                .enqueueMusic(id, apiName)
                .then(() => {
                  toastEnqueueOk(t);
                  setId("");
                })
                .catch((e) => {
                  toastError(t, `音乐 {id: ${id}} 加入队列失败`);
                  console.error(e);
                });
          }}
        >
          点歌
        </Button>
      </Flex>

      <Flex flexDirection={"row"} mb={4}>
        <Input
          flex={1}
          type="text"
          value={keyword}
          placeholder="输入歌曲名称"
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button ml={2} onClick={handleSearch} isLoading={loading}>
          搜索
        </Button>
      </Flex>

      {searchResults.length > 0 && (
        <>
          <Stack spacing={3}>
            <List spacing={4}>
              {currentPageData.map((music, index) => (
                <Box key={index}>
                  <ListItem fontSize={"lg"}>
                    <Flex alignItems="center">
                      {/* 歌曲封面 */}
                      <Image
                        src={music.imgUrl} // 假设封面 URL 存储在 music.imgUrl
                        alt={music.name} // 封面图片的 alt 属性
                        boxSize="50px" // 固定封面图片大小
                        objectFit="cover" // 使图片自适应
                        borderRadius="md" // 给图片加一点圆角
                        mr={4} // 设置图片和右侧内容的间距
                      />

                      {/* 显示歌曲信息 */}
                      <Box flex={1}>
                        <Text fontWeight="bold">{music.name}</Text>
                        <Text fontSize={"sm"}>{music.artists.join(", ")}</Text>
                      </Box>

                      {/* 点歌按钮 */}
                      <Tooltip hasArrow label={"将此歌曲加入队列"}>
                        <Button
                          onClick={() => {
                            props.conn
                              .enqueueMusic(music.id, apiName)
                              .then(() => {
                                toastEnqueueOk(t);
                              })
                              .catch((e) => {
                                toastError(
                                  t,
                                  `音乐 {id: ${music.id}} 加入队列失败`
                                );
                                console.error(e);
                              });
                          }}
                        >
                          点歌
                        </Button>
                      </Tooltip>
                    </Flex>
                  </ListItem>

                  {/* 在每个歌曲项之间插入分割线，最后一个除外 */}
                  {index < currentPageData.length - 1 && <Divider mt={3} />}
                </Box>
              ))}
            </List>
          </Stack>

          {/* 翻页按钮 */}
          <Flex justifyContent={"space-between"} alignItems={"center"} mt={4}>
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={page === 1}
            >
              上一页
            </Button>
            <Text>{`第 ${page} 页 / 共 ${totalPages} 页`}</Text>
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={page === totalPages}
            >
              下一页
            </Button>
          </Flex>
        </>
      )}
    </>
  );
};
