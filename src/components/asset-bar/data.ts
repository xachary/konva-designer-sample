import * as Types from '@/Render/types'

// 从 public 加载静态资源 + 自定义连接点
export const assetsModules: {
  svg: Array<Types.AssetInfo>
  image: Array<Types.AssetInfo>
  gif: Array<Types.AssetInfo>
  json: Array<Types.AssetInfo>
  more: Array<Types.AssetInfo>
} = {
  svg: [
    {
      url: './img/svg/ARRESTER_1.svg',
      points: [
        { x: 101, y: 1, direction: 'top' },
        { x: 101, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/ARRESTER_2.svg',
      points: [
        { x: 101, y: 1, direction: 'top' },
        { x: 101, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/ARRESTER_2_1.svg',
      points: [
        { x: 101, y: 1, direction: 'top' },
        { x: 101, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/BREAKER_CLOSE.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/BREAKER_OPEN.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/CAPACITOR.svg',
      points: [
        { x: 99, y: 1, direction: 'top' },
        { x: 99, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/CT_1.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/CT_2.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/HL.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/POTENTIAL_TRANSFORMER_2.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/POT_TRANS_3_WINDINGS.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 70, y: 199, direction: 'bottom' },
        { x: 130, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/PT.svg',
      points: [
        { x: 34, y: 100, direction: 'left' },
        { x: 98, y: 100, direction: 'right' }
      ]
    },
    {
      url: './img/svg/PT_1.svg',
      points: [
        { x: 101, y: 1, direction: 'top' },
        { x: 101, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/REACTOR.svg',
      points: [
        { x: 98, y: 1, direction: 'left' },
        { x: 98, y: 199, direction: 'right' }
      ]
    },
    {
      url: './img/svg/REGYCAPACITOR.svg',
      points: [
        { x: 1, y: 101, direction: 'left' },
        { x: 199, y: 101, direction: 'right' }
      ]
    },
    {
      url: './img/svg/SERIES_CAPACITOR.svg',
      points: [
        { x: 1, y: 101, direction: 'left' },
        { x: 199, y: 101, direction: 'right' }
      ]
    },
    {
      url: './img/svg/SHUNT_REACTOR.svg',
      points: [
        { x: 98, y: 1, direction: 'top' },
        { x: 98, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/SHUNT_REACTOR_1.svg',
      points: [
        { x: 98, y: 1, direction: 'top' },
        { x: 98, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/SIX_CIRCLE.svg',
      points: [
        { x: 99, y: 1, direction: 'top' },
        { x: 99, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/ST.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/THERR_CIRCLE.svg',
      points: [
        { x: 99, y: 43, direction: 'top' },
        { x: 99, y: 157, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/combin.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/combin3.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/combin4.svg',
      points: [
        { x: 101, y: 1, direction: 'top' },
        { x: 101, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/combin5.svg',
      points: [
        { x: 99, y: 1, direction: 'top' },
        { x: 99, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/xianshideng.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' }
      ]
    },
    {
      url: './img/svg/MEMRISTOR_1.svg',
      points: [
        { x: 1, y: 101, direction: 'left' },
        { x: 199, y: 101, direction: 'right' }
      ]
    },
    {
      url: './img/svg/guangfufadian.svg',
      points: [
        { x: 100, y: 62, direction: 'top' },
        { x: 100, y: 138, direction: 'bottom' },
        { x: 27, y: 100, direction: 'left' },
        { x: 173, y: 100, direction: 'right' }
      ]
    },
    {
      url: './img/svg/REGUINDUCTOR.svg',
      points: [
        { x: 100, y: 66, direction: 'top' },
        { x: 100, y: 134, direction: 'bottom' },
        { x: 1, y: 100, direction: 'left' },
        { x: 199, y: 100, direction: 'right' }
      ]
    },
    {
      url: './img/svg/AC_2.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' },
        { x: 1, y: 100, direction: 'left' },
        { x: 199, y: 100, direction: 'right' }
      ]
    },
    {
      url: './img/svg/AC_SOURCE.svg',
      points: [
        { x: 100, y: 1, direction: 'top' },
        { x: 100, y: 199, direction: 'bottom' },
        { x: 1, y: 100, direction: 'left' },
        { x: 199, y: 100, direction: 'right' }
      ]
    },
    { url: './img/svg/EQUIVALENTSOURCE.svg', points: [{ x: 100, y: 100 }] }
  ],
  image: [
    {
      url: './img/png/1.png',
      points: [
        { x: 52, y: 2, direction: 'top' },
        { x: 52, y: 100, direction: 'bottom' },
        { x: 2, y: 51, direction: 'left' },
        { x: 101, y: 51, direction: 'right' }
      ]
    },
    { url: './img/png/2.png' },
    { url: './img/jpg/big.jpg' }
  ],
  gif: [
    { url: './img/gif/5.gif', points: [{ x: 100, y: 100 }] },
    { url: './img/gif/6.gif' },
    { url: './img/gif/8.gif' }
  ],
  json: [
    { url: './json/1.json', avatar: './json/1.png' },
    { url: './json/2.json', avatar: './json/2.png' },
    { url: './json/3.json', avatar: './json/3.png' },
    { url: './json/4.json', avatar: './json/4.png' },
    { url: './json/5.json', avatar: './json/5.png' }
  ],
  more: [
    { url: './img/svg/a-CT2xianghu.svg' },
    { url: './img/svg/a-CTsanxiang.svg' },
    { url: './img/svg/combin2.svg' },
    { url: './img/svg/ARCSUPPCOIL.svg' },
    { url: './img/svg/INDUCTOR.svg' },
    { url: './img/svg/IRONCOREGAPINDUCTOR.svg' },
    { url: './img/svg/IRONCOREINDUCTOR.svg' },
    { url: './img/svg/IRONCOREVARINDUCTOR.svg' },
    { url: './img/svg/CT.svg' },
    { url: './img/svg/GROUND.svg' },
    { url: './img/svg/LOAD.svg' },
    { url: './img/svg/PROTECT_GROUND.svg' },
    { url: './img/svg/CT_3.svg' },
    { url: './img/svg/DDCT.svg' },
    { url: './img/svg/FLANGED_CONNECTION.svg' },
    { url: './img/svg/jiedidaozha.svg' },
    { url: './img/svg/sukeduanluqi.svg' },
    { url: './img/svg/DELTAWINDING.svg' },
    { url: './img/svg/MULTIPLIER.svg' },
    { url: './img/svg/WINDING.svg' },
    { url: './img/svg/WINDINGX.svg' },
    { url: './img/svg/YWINDING.svg' },
    { url: './img/png/3.png' },
    { url: './img/png/7.png' },
    { url: './img/png/9.png' }
  ]
}
