import { TriangleUpIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Text,
  Card,
  CardHeader,
  Heading,
  CardBody,
  OrderedList,
  ListItem,
  Box,
  Highlight,
  Flex,
  Tooltip,
  IconButton,
  Divider,
  Image,
} from '@chakra-ui/react';
import { MusicOrderAction } from '../api/musichub';

export const MusicQueue = (props: {
  queue: MusicOrderAction[];
  top: (actionId: string) => void;
  remove: (actionId: string) => void; // 删除方法
}) => {
  return (
    <Card mt={4}>
      <CardHeader>
        <Heading size={'lg'}>播放队列</Heading>
      </CardHeader>

      {/* 固定高度的 CardBody，超出部分滚动显示 */}
      <CardBody
        maxHeight="300px" // 设置固定高度
        overflowY="auto"  // 启用垂直滚动
      >
        <OrderedList spacing={4}>
          {props.queue.length > 0 ? (
            props.queue.map((v, index) => (
              <Box key={v.actionId}>
                <ListItem fontSize={'lg'}>
                  <Flex alignItems="center">
                    {/* 歌曲封面 */}
                    <Image
                      src={v.music.imgUrl} // 假设封面 URL 存储在 v.music.imgUrl
                      alt={v.music.name}      // 封面图片的 alt 属性
                      boxSize="50px"          // 固定封面图片大小
                      objectFit="cover"       // 使图片自适应
                      borderRadius="md"       // 给图片加一点圆角
                      mr={4}                  // 设置图片和右侧内容的间距
                    />

                    {/* 显示歌曲信息 */}
                    <Box flex={1}>
                      <Text fontWeight="bold">{v.music.name}</Text>
                      <Text fontSize={'sm'}>{v.music.artists}</Text>
                      <Text fontSize={'xs'} fontStyle={'italic'}>
                        由 {v.enqueuerName} 点歌
                      </Text>
                    </Box>

                    {/* 删除按钮 */}
                    <Tooltip hasArrow label={'从队列中删除此歌曲'}>
                      <IconButton
                        onClick={() => props.remove(v.actionId)} // 调用删除函数
                        aria-label={'删除'}
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        mr={2}
                      />
                    </Tooltip>

                    {/* 置顶按钮 */}
                    {index !== 0 && (
                      <Tooltip hasArrow label={'将此歌曲置于队列顶端'}>
                        <IconButton
                          onClick={() => props.top(v.actionId)}
                          aria-label={'置顶'}
                          icon={<TriangleUpIcon />}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                </ListItem>

                {/* 在每个歌曲项之间插入分割线，最后一个除外 */}
                {index < props.queue.length - 1 && <Divider mt={3} />}
              </Box>
            ))
          ) : (
            <Text size={'md'}>
              <Highlight
                query={'点歌'}
                styles={{ px: '2', py: '1', rounded: 'full', bg: 'teal.100' }}
              >
                播放队列为空，请随意点歌吧~
              </Highlight>
            </Text>
          )}
        </OrderedList>
      </CardBody>
    </Card>
  );
};
