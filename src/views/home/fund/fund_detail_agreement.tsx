import React, { FC } from 'react';
import { View, StyleSheet, TouchableNativeFeedback } from 'react-native';
import { Text } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { themeWhite, themeTextGray, defaultThemeColor } from '../../../config/theme';

const HomeFundDetailAgreement: FC<{success: () => void;}> = ({ success }) => {
  const agreenmentText = [
    '甲方（委托方）：基金认购人',
    '乙方（受托方）：AlfaEx(ETF管理人)',
    '',
    // eslint-disable-next-line max-len
    '  甲方为基金份额认购持有人甲方通过乙方提供的app网签电子协议来认购本基金取得本基金基金份额，即成为基金份额持有人和本基金协议的当事人，在认购前，认证阅读本基金协议，选择“我已阅读”并确认，并进行基金份额认购的行为将表明对其协议的承认和接受。乙方按照本基金协议及其他有关法律法规规定享有权利、承担义务。甲、乙双方本着公平、自愿、互利和诚实信用的原则，就甲方提供乙方服务达成如下协议。',
    '',
    '一、基金的基本情况',
    '（一）基金名称：ETF-DeFi-01',
    '（二）基金的类别：灵活配置型基金（保本型）',
    '（三）基金的运作方式：契约型',
    '（四）基金投资目标：在严格控制投资风险的基础上，谋求基金资产的长期稳定增值。',
    '（五）基金募集份额规模：本基金的募集份额规模为 200万usdt',
    '（六）基金最低认购额：基金最低认购额为5万usdt',
    '（七）基金收益：月化10%-15%',
    '（八）存续期间：持续经营',
    '',
    '二、甲方的义务',
    '（一）乙方不得向甲方不定期提出基金管理服务以外服务。',
    '（二）不得夸大事实，诱导他人认购本基金产品，已经证实，锁定其基金账户。',
    '（三）认真服务客户，消除他人偏见，正本清源，维护平台利益与声誉。',
    '（四）乙方通过APP线上认购所持基金份额完成后，在基金存续期间不得进行本金赎回，存续期满后通过app提交赎回本金。',
    '',
    '三、乙方的权利',
    '（一）线上募集基金；',
    '（二）自本基金协议生效之日起，独立管理运用基金财产；',
    '（三）制订、修改并公布有关基金认购、赎回、收益分配等方面的业务规则；',
    '',
    '四、乙方的义务',
    '（一）自基金协议生效之日起，以诚实信用、勤勉尽责的原则管理和运用基金财产； ',
    '（二）配备足够的具有专业资格的人员进行基金投资分析、决策，以专业化的经营方式管理和运作基金财产；',
    '（三）建立健全内部风险控制、监察与稽核、财务管理及人事管理等制度，保证所管理的基金财产和基金管理人的财产相互独立，对所管理的不同基金分别管理、分别记账，进行投资； ',
    '（四）编制基金红利报告，并定期向甲方发布；',
    '（五）按规定受理认购和赎回申请，及时、足额支付赎回款项；',
    '',
    '五、基金的解散 ',
    '（一）基金存续期满解散 本基金的存续期为 1 年，存续期满后自动解散。',
    '（二）达到亏损比例解散 基金管理人规定本基金最大亏损额度为基金募集金额的 20%，超过这一比例，本基金将自动解散，亏损部分由乙方承担，与甲方无关。',
    '',
    '六、免责申明',
    '甲方在认购本基金产品和以及本金赎回时，需要资金划转，目前由于支持usdt的智能合约有ERC20、OMNI、TRC20，在分红转出时务必按照系统提示的ERC20智能合约地址转出，因为转出后无法找回，这是区块链的特性。如若由于甲方地址提供接收地址与ERC20合约不相符，由此造成的损失均有甲方承担。',
  ];

  return (
    <View style={style.bgBox}>
      <Text style={style.title}>
        《ETF-DeFi-01基金认购电子协议》
      </Text>
      <ScrollView style={style.scrollView}>
        {
          agreenmentText.map((item, index) => (
            <Text key={index} style={style.scrollText}>
              {item}
            </Text>
          ))
        }
      </ScrollView>
      <View style={style.btnsView}>
        <TouchableNativeFeedback onPress={() => success()}>
          <Text style={[style.btnsNone, style.btnsSuccess]}>我已知悉</Text>
        </TouchableNativeFeedback>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  bgBox: {
    backgroundColor: themeWhite,
    width: '80%',
    borderRadius: 5,
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  scrollView: {
    height: 300,
  },
  scrollText: {
    fontSize: 15,
    color: themeTextGray,
    lineHeight: 24,
  },
  checkBoxTitle: {
    color: defaultThemeColor,
  },
  btnsView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  btnsNone: {
    color: themeTextGray,
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
    paddingBottom: 5,
  },
  btnsSuccess: {
    color: defaultThemeColor,
  },
});

export default HomeFundDetailAgreement;
