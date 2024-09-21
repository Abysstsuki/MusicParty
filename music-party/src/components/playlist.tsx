import {
  Text,
  AccordionItem,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  List,
  ListItem,
  Flex,
  Button,
  Skeleton,
  Stack,
  Divider,
  Image,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getMusicsByPlaylist, Music } from '../api/api';

export const Playlist = (props: {
  id: string;
  name: string;
  apiName: string;
  enqueue: (id: string, apiName: string) => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [musics, setMusics] = useState<Music[]>([]);
  const [canshow, setCanshow] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loaded) return;
    getMusicsByPlaylist(props.id, page, props.apiName).then((res) =>
      setMusics(res)
    );
  }, [page]);

  return (
    <AccordionItem>
      <h2>
        <AccordionButton
          onClick={async () => {
            if (loaded) return;
            else setLoaded(true);
            const musics = await getMusicsByPlaylist(
              props.id,
              1,
              props.apiName
            );
            setMusics(musics);
            setCanshow(true);
          }}
        >
          <Box as="span" flex="1" textAlign="left">
            {props.name}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <Skeleton isLoaded={canshow}>
          {musics.length > 0 || (musics.length === 0 && page !== 1) ? (
            <Stack>
              <Divider />
              <List spacing={4}>
                {musics.map((m, index) => (
                  <Box key={m.id}>
                    <ListItem>
                      <Flex alignItems="center">
                        {/* 歌曲封面 */}
                        <Image
                          src={m.imgUrl} // 假设封面 URL 存储在 m.imgUrl
                          alt={m.name}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                          mr={4}
                        />

                        {/* 歌曲信息 */}
                        <Box flex={1}>
                          <Text fontWeight="bold">{m.name}</Text>
                          <Text fontSize={'sm'}>{m.artists.join(', ')}</Text>
                        </Box>

                        {/* 点歌按钮 */}
                        <Button
                          onClick={() => {
                            props.enqueue(m.id, props.apiName);
                          }}
                        >
                          点歌
                        </Button>
                      </Flex>
                    </ListItem>

                    {/* 在每个歌曲项之间插入分割线，最后一个除外 */}
                    {index < musics.length - 1 && <Divider mt={3} />}
                  </Box>
                ))}
              </List>
              <Divider />
              <Flex justifyContent={'flex-end'} alignItems="center">
                <Text>{`第 ${page} 页`}</Text>
                <Button
                  colorScheme={'teal'}
                  ml={4}
                  onClick={() => setPage((prev) => (prev > 1 ? prev - 1 : 1))}
                >
                  上一页
                </Button>
                <Button
                  colorScheme={'teal'}
                  ml={4}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  下一页
                </Button>
              </Flex>
            </Stack>
          ) : (
            <Text>歌单为空</Text>
          )}
        </Skeleton>
      </AccordionPanel>
    </AccordionItem>
  );
};
