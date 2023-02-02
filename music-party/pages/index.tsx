import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import { connection, music } from '../src/api/musichub'
import { Text, Button, Card, CardBody, CardHeader, Grid, GridItem, Heading, Input, ListItem, OrderedList, Tab, TabList, TabPanel, TabPanels, Tabs, useToast, Stack, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, useDisclosure, UnorderedList, Flex, Highlight, Box } from '@chakra-ui/react'
import { MusicPlayer } from '../src/components/musicplayer';
import { getProfile } from '../src/api/api';
import { NeteaseBinder } from '../src/components/neteasebinder';
import { MyPlaylist } from '../src/components/myplaylist';
import { toastEnqueueOk, toastError } from '../src/utils/toast';

export default function Home() {
  const [id, setId] = useState("");
  const [src, setSrc] = useState("");
  const [playtime, setPlaytime] = useState(0);
  const [nowPlaying, setNowPlaying] = useState<{ music: music, enqueuer: string }>();
  const [queue, setQueue] = useState<{ music: music, enqueuer: string }[]>([]);
  const [userName, setUserName] = useState("");
  const [newName, setNewName] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [inited, setInited] = useState(false);
  const [chatContent, setChatContent] = useState<{ name: string, content: string }[]>([]);
  const [chatToSend, setChatToSend] = useState("");
  const t = useToast();

  const conn = useRef<connection>();
  useEffect(() => {
    if (!conn.current) {
      fetch("/api/new").then(() => {
        conn.current = new connection(`${window.location.origin}/music`,
          async (music: music, enqueuer: string, time: number) => {
            console.log(music);
            setSrc(music.url);
            setNowPlaying({ music, enqueuer });
            setPlaytime(time);
          }, async () => {
            const q = await conn.current!.getMusicQueue();
            console.log(q);
            setQueue(q);
          }, async () => {
            const users = await conn.current!.getOnlineUsers();
            setOnlineUsers(users);
          }, (({ name, content }) => {
            setChatContent(c => c.concat({ name, content }));
          }));
        conn.current.start();

        getProfile().then((u) => {
          setUserName(u.name);
        }).catch((e) => {
          console.log(e);
          toastError(t, "Please refresh this page to retry.")
        });

        setInited(true);
      }).catch(() => {
        toastError(t, "Please refresh this page to retry.")
      })
    }
  }, []);

  return (
    <Grid templateAreas={`"nav main"`} gridTemplateColumns={"2fr 5fr"} gap="1">
      <Head>
        <title>Music Party</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GridItem area={"nav"}>
        <Stack>
          <Card>
            <CardHeader>
              <Heading>{`Welcome, ${userName}!`}</Heading>
            </CardHeader>
            <CardBody>
              <Stack>
                <Popover>
                  {({ onClose }) => (<>
                    <PopoverTrigger>
                      <Button>Rename</Button>
                    </PopoverTrigger>
                    <Portal>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>Rename</PopoverHeader>
                        <PopoverCloseButton />
                        <PopoverBody>
                          <Input value={newName} placeholder={"Input your new name here."}
                            onChange={(e) => setNewName(e.target.value)}>
                          </Input>
                        </PopoverBody>
                        <PopoverFooter>
                          <Button colorScheme='blue' onClick={async () => {
                            if (newName === "") return;
                            await conn.current!.rename(newName);
                            const profile = await getProfile();
                            setUserName(profile.name);
                            onClose();
                            setNewName("");
                          }}>Comfirm</Button>
                        </PopoverFooter>
                      </PopoverContent>
                    </Portal>
                  </>)}
                </Popover>
                <NeteaseBinder />
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Heading>
                Online Users
              </Heading>
            </CardHeader>
            <CardBody>
              <UnorderedList>
                {onlineUsers.map((u) => {
                  return <ListItem key={u}>
                    {u}
                  </ListItem>
                })}
              </UnorderedList>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Heading>
                Chat
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex>
                <Input flex={1} value={chatToSend} onChange={e => setChatToSend(e.target.value)} />
                <Button onClick={async () => {
                  if (chatToSend === "") return;
                  await conn.current?.ChatSay(chatToSend);
                  setChatToSend("");
                }}>Send</Button>
              </Flex>
              <UnorderedList>
                {chatContent.map(s => <ListItem key={Math.random() * 1000}>
                  {`${s.name}: ${s.content}`}
                </ListItem>)}
              </UnorderedList>
            </CardBody>
          </Card>
        </Stack>
      </GridItem>

      <GridItem area={"main"}>
        <Tabs>
          <TabList>
            <Tab>
              Music Play
            </Tab>
            <Tab>
              Music Selection
            </Tab>
            <Tab>
              My Playlists
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Flex direction={"row"} mb={4} alignItems={"flex-end"}>
                {nowPlaying ? <>
                  <Heading>
                    {`Now Playing:\n ${nowPlaying?.music.name} - ${nowPlaying?.music.artist}`}
                  </Heading>
                  <Text size={"md"} fontStyle={"italic"} ml={2}>
                    {`Enqueued by ${nowPlaying?.enqueuer}`}
                  </Text>
                </> : <Heading>
                  Now Playing: Nothing
                </Heading>
                }
              </Flex>

              <Card mb={4}>
                <CardHeader>
                  <Heading size={"lg"}>Queue</Heading>
                </CardHeader>
                <CardBody>
                  <OrderedList>
                    {queue.length > 0 ? queue.map((v) => (
                      <ListItem key={v.music.name} fontSize={"lg"}>
                        <Box>
                          {v.music.name} - {v.music.artist}
                          <Text fontSize={"sm"} fontStyle={"italic"}>
                            enqueued by {v.enqueuer}
                          </Text>
                        </Box>
                      </ListItem>)) : <Text size={"md"}>
                      <Highlight query={"enqueue"} styles={{ px: '2', py: '1', rounded: 'full', bg: 'teal.100' }}>
                        The queue is null currently, feel free to enqueue some music.
                      </Highlight>
                    </Text>}
                  </OrderedList>
                </CardBody>
              </Card>

              <MusicPlayer src={src} playtime={playtime} nextClick={() => {
                conn.current?.nextSong();
              }} reset={() => {
                console.log("reset");
                conn.current?.RequestSetNowplaying();
                conn.current?.RequestQueueUpdate();
              }} />

            </TabPanel>
            <TabPanel>
              <Input type={"text"} value={id} placeholder={"type music id here"} onChange={e => {
                setId(e.target.value);
              }} />
              <Button onClick={() => {
                if (id.length > 0)
                  conn.current?.AddMusicToQueue(id).then(() => {
                    toastEnqueueOk(t);
                    setId("");
                  }).catch(() => {
                    toastError(t, `Enqueuing music {id: ${id}} failed.`);
                  });
              }}>
                Enqueue
              </Button>
            </TabPanel>
            <TabPanel>
              {!inited ? <Text>Initializing...</Text> :
                <MyPlaylist enqueue={(id) => {
                  conn.current!.AddMusicToQueue(id)
                    .then(() => {
                      toastEnqueueOk(t);
                    }).catch(() => {
                      toastError(t, `Enqueuing music {id: ${id}} failed.`);
                    })
                }} />
              }
            </TabPanel>
          </TabPanels>
        </Tabs>
      </GridItem>
    </Grid>
  )
}
