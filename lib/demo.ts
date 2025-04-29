import type { Edge, Node, Viewport } from '@xyflow/react';

export const sampleNodes: Node[] = [
  {
    id: 'vgWgaLMHG6Y6MMwu_VF1D',
    type: 'text',
    data: {
      source: 'primitive',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { color: 'rgb(31, 31, 31)' },
                  },
                ],
                text: 'Delphiniums generally symbolize ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { color: 'rgb(31, 31, 31)' },
                  },
                  { type: 'bold' },
                ],
                text: 'cheerfulness, goodwill, and protection',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { color: 'rgb(31, 31, 31)' },
                  },
                ],
                text: '. Specifically, they can represent striving for success, enjoying life, and celebrating important occasions. Blue delphiniums are also often associated with dignity and grace. ',
              },
            ],
          },
        ],
      },
      text: 'Delphiniums generally symbolize cheerfulness, goodwill, and protection. Specifically, they can represent striving for success, enjoying life, and celebrating important occasions. Blue delphiniums are also often associated with dignity and grace. ',
    },
    position: { x: -258, y: 30 },
    origin: [0, 0.5],
    measured: { width: 400, height: 203 },
    selected: false,
    dragging: false,
    width: 400,
    height: 203,
    resizing: false,
  },
  {
    id: 'JJzrv-IFLZADn1asQfMOU',
    type: 'text',
    position: { x: 261, y: -220 },
    data: {
      source: 'transform',
      text: 'To care for delphiniums, plant them in rich, well-draining soil with full sun exposure. Water regularly, keeping the soil moist but not waterlogged. Support tall stems with stakes, and remove faded blooms to encourage more flowers. Fertilize during the growing season and cut back after flowering to promote new growth.',
      instructions: 'How do you care for them?',
    },
    origin: [0, 0.5],
    measured: { width: 400, height: 270 },
    width: 400,
    height: 270,
    selected: false,
    dragging: false,
  },
  {
    id: 'KprCwFIjHi90enH4BX_bf',
    type: 'comment',
    data: {
      source: 'primitive',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'A visual AI workflow app, powered by Supabase and the Vercel AI SDK.',
              },
            ],
          },
        ],
      },
      text: 'A visual AI workflow app, powered by Supabase and the Vercel AI SDK.',
    },
    position: { x: -249, y: -224 },
    origin: [0, 0.5],
    measured: { width: 279, height: 40 },
    selected: false,
    dragging: false,
    width: 279,
    height: 40,
    resizing: false,
  },
  {
    id: '46chONcEHliE7UChIseQm',
    type: 'logo',
    data: { source: 'primitive' },
    position: { x: -250, y: -281 },
    origin: [0, 0.5],
    measured: { width: 145, height: 33 },
    selected: false,
    dragging: false,
    width: 145,
    height: 33.241106719367586,
    resizing: false,
  },
  {
    id: 'wiHfpZJA_mGy1vQOULuOA',
    type: 'image',
    position: { x: 259, y: 115 },
    data: {
      source: 'transform',
      content: {
        url: '/demo/delphiniums-anime.jpg',
        type: 'image/jpeg',
      },
      instructions: 'Make it anime style.',
    },
    origin: [0, 0.5],
    measured: { width: 400, height: 290 },
    selected: false,
    dragging: false,
    width: 400,
    height: 290,
    resizing: false,
  },
  {
    id: 'LChjpwMpTwx4CaEypTsAr',
    type: 'audio',
    data: {
      source: 'primitive',
      audio: {
        url: '/demo/delphiniums-primitive.mp3',
        type: 'audio/mpeg',
      },
    },
    position: { x: -256, y: 245 },
    origin: [0, 0.5],
    measured: { width: 302, height: 156 },
    selected: false,
    dragging: false,
  },
  {
    id: 'lMrWEm_K9EbGledg2JzAY',
    type: 'video',
    data: {
      source: 'transform',
      instructions: 'Make the flowers move softly in the wind.',
      model: 'T2V-01-Director',
    },
    position: { x: 800, y: -350 },
    origin: [0, 0.5],
    measured: { width: 302, height: 156 },
    selected: false,
    dragging: false,
  },
  {
    id: 'bKrEf7e5GPMu0-uphit6D',
    type: 'text',
    data: {
      source: 'transform',
      text: 'The image is a 2D anime-style digital illustration showing a wide, panoramic (16:9 ratio) field of tall, blue delphinium flowers under a bright blue sky with scattered fluffy white clouds. The delphiniums are richly detailed, with layered petals and lush green leaves, creating a vibrant and cheerful atmosphere. The perspective feels open and expansive, emphasizing the endless stretch of flowers and the peacefulness of the clear day.',
      instructions: 'Describe this image.',
    },
    position: { x: 800, y: 0 },
    origin: [0, 0.5],
    measured: { width: 400, height: 315 },
    width: 400,
    height: 315,
    selected: false,
    dragging: false,
  },
  {
    id: 'bS3iDAT96T6tlUD549HI4',
    type: 'image',
    data: {
      source: 'transform',
      content: {
        url: '/demo/delphiniums-fantasy.jpg',
        type: 'image/jpeg',
      },
      instructions: 'Generate a version of this image with a fantasy vibe.',
    },
    position: { x: 800, y: 350 },
    origin: [0, 0.5],
    measured: { width: 400, height: 290 },
    width: 400,
    height: 290,
    selected: false,
    dragging: false,
  },
  {
    id: '-UWhefN0_XOKHo7XbN2pY',
    type: 'audio',
    data: {
      source: 'transform',
      audio: {
        url: '/demo/delphiniums-transform.mp3',
        type: 'audio/mpeg',
      },
    },
    position: { x: 259, y: 350 },
    origin: [0, 0.5],
    measured: { width: 284, height: 52 },
    selected: false,
    dragging: false,
  },
];

export const sampleEdges: Edge[] = [
  {
    id: 'YJr0HFcANkUjBhA7Aogl0',
    source: 'vgWgaLMHG6Y6MMwu_VF1D',
    target: 'JJzrv-IFLZADn1asQfMOU',
    type: 'animated',
  },
  {
    id: '23onV03W3MzwvPHg5a5VG',
    source: 'vgWgaLMHG6Y6MMwu_VF1D',
    target: 'wiHfpZJA_mGy1vQOULuOA',
    type: 'animated',
  },
  {
    source: 'wiHfpZJA_mGy1vQOULuOA',
    target: 'bS3iDAT96T6tlUD549HI4',
    type: 'animated',
    id: 'xy-edge__wiHfpZJA_mGy1vQOULuOA-bS3iDAT96T6tlUD549HI4',
  },
  {
    source: 'wiHfpZJA_mGy1vQOULuOA',
    target: 'bKrEf7e5GPMu0-uphit6D',
    type: 'animated',
    id: 'xy-edge__wiHfpZJA_mGy1vQOULuOA-bKrEf7e5GPMu0-uphit6D',
  },
  {
    source: 'wiHfpZJA_mGy1vQOULuOA',
    target: 'lMrWEm_K9EbGledg2JzAY',
    type: 'animated',
    id: 'xy-edge__wiHfpZJA_mGy1vQOULuOA-lMrWEm_K9EbGledg2JzAY',
  },
  {
    source: 'vgWgaLMHG6Y6MMwu_VF1D',
    target: '-UWhefN0_XOKHo7XbN2pY',
    type: 'animated',
    id: 'xy-edge__vgWgaLMHG6Y6MMwu_VF1D--UWhefN0_XOKHo7XbN2pY',
  },
  {
    source: 'LChjpwMpTwx4CaEypTsAr',
    target: 'wiHfpZJA_mGy1vQOULuOA',
    type: 'animated',
    id: 'xy-edge__LChjpwMpTwx4CaEypTsAr-wiHfpZJA_mGy1vQOULuOA',
  },
];

export const sampleViewport: Viewport = {
  x: 423.6692594530857,
  y: 411.67031344536565,
  zoom: 0.5,
};
