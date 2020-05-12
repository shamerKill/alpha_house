``` jsx
<Header
statusBarProps={{ barStyle: 'light-content', translucent: true, backgroundColor: '#00000000' }}
placement="left"
leftComponent={{ icon: 'menu', color: '#fff' }}
centerComponent={{ text: '标题组件', style: { color: '#fff' } }}
rightComponent={{ icon: 'home', color: '#fff' }}
containerStyle={{
  backgroundColor: '#3D6DCC',
  justifyContent: 'space-around',
}}
ViewComponent={LinearGradient}
linearGradientProps={{
  colors: ['red', '#f90'],
  start: { x: 0, y: 0.8 },
  end: { x: 1, y: 0.8 },
}} />
```