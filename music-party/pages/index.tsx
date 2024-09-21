import "../styles/Home.module.css";
import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';
import { Connection, Music, MusicOrderAction } from '../src/api/musichub';
import {
  Text,
  Button,
  chakra,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  Input,
  ListItem,
  OrderedList,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  Stack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  UnorderedList,
  Flex,
  Highlight,
  Box,
  Icon
} from '@chakra-ui/react';
import { MusicPlayer } from '../src/components/musicplayer';
import { VideoPlayer } from '../src/components/videoplayer';
import { getMusicApis, getProfile } from '../src/api/api';
import { NeteaseBinder } from '../src/components/neteasebinder';
import { MyPlaylist } from '../src/components/myplaylist';
import { toastEnqueueOk, toastError, toastInfo, toastRedInfo } from '../src/utils/toast';
import { MusicSelector } from '../src/components/musicselector';
import { QQMusicBinder } from '../src/components/qqmusicbinder';
import { MusicQueue } from '../src/components/musicqueue';
import { BilibiliBinder } from '../src/components/bilibilibinder';

export default function Home() {
  const [src, setSrc] = useState('');
  const [playtime, setPlaytime] = useState(0);
  const [nowPlaying, setNowPlaying] = useState<{
    music: Music;
    enqueuer: string;
  }>();
  const [queue, setQueue] = useState<MusicOrderAction[]>([]);
  const [userName, setUserName] = useState('');
  const [newName, setNewName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<
    { id: string; name: string }[]
  >([]);
  const [inited, setInited] = useState(false);
  const [chatContent, setChatContent] = useState<
    { name: string; content: string }[]
  >([]);
  const [chatToSend, setChatToSend] = useState('');
  const [apis, setApis] = useState<string[]>([]);
  const t = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  const conn = useRef<Connection>();



  useEffect(() => {
    if (!conn.current) {
      conn.current = new Connection(
        `${window.location.origin}/music`,
        async (music: Music, enqueuerName: string, playedTime: number) => {
          console.log(music);
          setSrc(music.url);
          setNowPlaying({ music, enqueuer: enqueuerName });
          setPlaytime(playedTime);
        },
        async (actionId: string, music: Music, enqueuerName: string) => {
          setQueue((q) => q.concat({ actionId, music, enqueuerName }));
        },
        async () => {
          setQueue((q) => q.slice(1));
        },
        async (actionId: string, operatorName: string) => {
          setQueue((q) => {
            const target = q.find((x) => x.actionId === actionId)!;
            toastInfo(
              t,
              `歌曲 "${target.music.name}-${target.music.artists}" 被 ${operatorName} 置顶了`
            );
            return [target].concat(q.filter((x) => x.actionId !== actionId));
          });
        },
        async (actionId: string, operatorName: string) => {
          setQueue((q) => {
            const target = q.find((x) => x.actionId === actionId);
            if (target) {
              toastRedInfo(
                t,
                `歌曲 "${target.music.name}-${target.music.artists.join(', ')}" 被 ${operatorName} 删除了`
              );
              // 从队列中移除这首歌
              return q.filter((x) => x.actionId !== actionId);
            }
            return q;
          });
        },
        async (operatorName: string, _) => {
          toastInfo(t, `${operatorName} 切到了下一首歌`);
        },
        async (id: string, name: string) => {
          setOnlineUsers((u) => u.concat({ id, name }));
        },
        async (id: string) => {
          setOnlineUsers((u) => u.filter((x) => x.id !== id));
        },
        async (id: string, newName: string) => {
          setOnlineUsers((u) =>
            u.map((x) => (x.id === id ? { id, name: newName } : x))
          );
        },
        async (name: string, content: string) => {
          setChatContent((c) => c.concat({ name, content }));
        },
        async (content: string) => {
          // todo
          console.log(content);
        },
        async (msg: string) => {
          console.error(msg);
          toastError(t, msg);
        }
      );
      conn.current
        .start()
        .then(async () => {
          try {
            const queue = await conn.current!.getMusicQueue();
            setQueue(queue);
            const users = await conn.current!.getOnlineUsers();
            setOnlineUsers(users);
          } catch (err: any) {
            toastError(t, err);
          }
        })
        .catch((e) => {
          console.error(e);
          toastError(t, '请刷新页面重试');
        });

      getProfile()
        .then((u) => {
          setUserName(u.name);
        })
        .catch((e) => {
          console.error(e);
          toastError(t, '请刷新页面重试');
        });

      getMusicApis().then((as) => setApis(as));

      setInited(true);
    }
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [chatContent]);

  return (
    <Box>
      <Flex flexDirection={{ base: "column", md: "row" }}>
        <Head>
          <title>🎵 音趴 🎵</title>
          <meta name='description' content='享受音趴！' />
          <link rel='icon' href='/favicon.ico' />
          <meta name='referrer' content='never' />
        </Head>
        <Stack width={{ base: "100%", md: "25%" }} flexGrow={1} gridGap={4}>
          <GridItem area={'nav'} className="userarea">
            <Stack m={4} spacing={4}>
              <Card>
                <CardHeader>
                  <Heading>{`欢迎, ${userName}!`}</Heading>
                  <Text>现已加入肯德基疯狂星期四豪华套餐</Text>
                </CardHeader>
                <CardBody>
                  <Stack>
                    <Popover>
                      {({ onClose }) => (
                        <>
                          <PopoverTrigger>
                            <Button>修改名字</Button>
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverHeader>修改名字</PopoverHeader>
                              <PopoverCloseButton />
                              <PopoverBody>
                                <Input
                                  value={newName}
                                  placeholder={'输入新名字'}
                                  onChange={(e) => setNewName(e.target.value)}
                                ></Input>
                              </PopoverBody>
                              <PopoverFooter>
                                <Button
                                  colorScheme='blue'
                                  onClick={async () => {
                                    if (newName === '') return;
                                    await conn.current!.rename(newName);
                                    const user = await getProfile();
                                    setUserName(user.name);
                                    onClose();
                                    setNewName('');
                                  }}
                                >
                                  确认
                                </Button>
                              </PopoverFooter>
                            </PopoverContent>
                          </Portal>
                        </>
                      )}
                    </Popover>
                    {apis.includes('NeteaseCloudMusic') && <NeteaseBinder />}
                    {apis.includes('QQMusic') && <QQMusicBinder />}
                    {apis.includes('Bilibili') && <BilibiliBinder />}
                  </Stack>
                </CardBody>
              </Card>
              {/* 在线 */}
              <Card>
                <CardHeader>
                  <Heading>在线</Heading>
                </CardHeader>
                <CardBody>
                  <UnorderedList>
                    {onlineUsers.map((u) => {
                      return (
                        <ListItem key={u.id}>
                          {u.name}
                        </ListItem>
                      );
                    })}
                  </UnorderedList>
                </CardBody>
              </Card>

              {/* 聊天 */}
              <Card h="400px" position="relative">
                <CardHeader>
                  <Heading>聊天</Heading>
                </CardHeader>

                {/* Scrollable chat content */}
                <CardBody
                  overflowY="auto"
                  maxH="300px"
                  pb="50px"
                >
                  <UnorderedList spacing={3}>
                    {chatContent.map((s, index) => (
                      <ListItem key={index} display="flex">
                        <Box
                          color="black"
                          borderRadius="md"
                          px={4}
                          py={2}
                          maxWidth="70%"
                        >
                          <Text fontWeight="bold">{s.name}</Text>
                          <Text>{s.content}</Text>
                        </Box>
                      </ListItem>
                    ))}
                  </UnorderedList>
                  <div ref={chatEndRef} /> {/* 滚动锚点 */}
                </CardBody>

                {/* Fixed input box at the bottom */}
                <Flex
                  as="footer"
                  position="absolute"
                  bottom={0}
                  left={0}
                  width="100%"
                  p={4}
                  bg="white"
                  boxShadow="0 -2px 5px rgba(0, 0, 0, 0.1)"
                >
                  <Input
                    flex={1}
                    value={chatToSend}
                    onChange={(e) => setChatToSend(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        if (chatToSend === '' || chatToSend.length >= 30) {
                          setChatToSend('');
                          return;
                        }
                        await conn.current?.chatSay(chatToSend);
                        setChatToSend('');
                      }
                    }}
                  />
                  <Button
                    ml={2}
                    onClick={async () => {
                      if (chatToSend === '' || chatToSend.length >= 30) {
                        setChatToSend('');
                        return;
                      }
                      await conn.current?.chatSay(chatToSend);
                      setChatToSend('');
                    }}
                  >
                    发送
                  </Button>
                </Flex>
              </Card>


            </Stack>
          </GridItem>
        </Stack>
        <Stack width={{ base: "100%", md: "75%" }} flexGrow={2} gridGap={4}>
          <GridItem area={'main'}>
            <Tabs>
              <TabList>
                <Tab>播放列表</Tab>
                <Tab>从音乐ID点歌</Tab>
                <Tab>从歌单点歌</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Box>
                    {nowPlaying ? (
                      <>
                        <Heading style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", fontWeight: "normal" }}>
                          {`由 ${nowPlaying?.enqueuer} 点歌`}
                          <MusicPlayer
                            src={src}
                            playtime={playtime}
                            nextClick={() => {
                              conn.current?.nextSong();
                            }}
                            reset={() => {
                              console.log('reset');
                              conn.current!.requestSetNowPlaying();
                              conn.current!.getMusicQueue().then((q) => {
                                setQueue(q);
                              });
                            }}
                            title={nowPlaying?.music.name || '暂无歌曲'}
                            artists={nowPlaying?.music.artists || ['未知艺术家']} //artists array
                            coverImage={nowPlaying?.music.imgUrl || '/default_cover.jpg'}
                          />
                          {/* {nowPlaying?.music.apiname === "NeteaseCloudMusic" && (
                            <img
                              src={nowPlaying?.music.imgUrl}
                              alt="音乐封面"
                              width={500}
                              height={500}
                              style={{ display: "block", margin: "0 auto" }}
                            />
                          )} */}

                          {/* {nowPlaying?.music.apiname === "Bilibili" && (
                            <VideoPlayer
                              src={src}
                              playtime={playtime}
                              aid={aid}
                              bvid={bvid}
                              cid={cid}
                            />
                          )} */}
                          {/* <span style={{ textAlign: "center", marginBottom: "10px", fontWeight: "normal" }}>
                            {nowPlaying?.music.name} - {nowPlaying?.music.artists}
                          </span> */}
                        </Heading>
                      </>
                    ) : (
                      <Heading style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", fontWeight: "normal" }}>暂无歌曲正在播放</Heading>
                    )}
                  </Box>

                  {/* <MusicPlayer
                    src={src}
                    playtime={playtime}
                    nextClick={() => {
                      conn.current?.nextSong();
                    }}
                    reset={() => {
                      console.log('reset');
                      conn.current!.requestSetNowPlaying();
                      conn.current!.getMusicQueue().then((q) => {
                        setQueue(q);
                      });
                    }}
                    title={nowPlaying?.music.name || '暂无歌曲'}
                    artists={nowPlaying?.music.artists || ['未知艺术家']} //artists array
                    coverImage={nowPlaying?.music.imgUrl || '/default_cover.jpg'}
                  /> */}

                  <MusicQueue
                    queue={queue}
                    top={(actionId) => {
                      conn.current!.topSong(actionId);
                    }}
                    remove={(actionId) => {
                      conn.current!.DelSong(actionId);
                    }} // 传递删除函数
                  />
                </TabPanel>
                <TabPanel>
                  <MusicSelector apis={apis} conn={conn.current!} />
                </TabPanel>
                <TabPanel>
                  {!inited ? (
                    <Text>初始化...</Text>
                  ) : (
                    <MyPlaylist
                      apis={apis}
                      enqueue={(id, apiName) => {
                        conn
                          .current!.enqueueMusic(id, apiName)
                          .then(() => {
                            toastEnqueueOk(t);
                          })
                          .catch(() => {
                            toastError(t, `音乐 {id: ${id}} 加入队列失败`);
                          });
                      }}
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>
        </Stack>
      </Flex>
    </Box>
  );
}
